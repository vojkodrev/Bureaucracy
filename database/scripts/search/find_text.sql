SET NOCOUNT ON;

IF OBJECT_ID(N'tempdb..#IgnoredTables') IS NOT NULL
    DROP TABLE #IgnoredTables;

IF OBJECT_ID(N'tempdb..#Columns') IS NOT NULL
    DROP TABLE #Columns;

IF OBJECT_ID(N'tempdb..#Matches') IS NOT NULL
    DROP TABLE #Matches;

DECLARE @SearchText nvarchar(4000) =
    N'Pri plačilu se sklicujte na številko';

CREATE TABLE #IgnoredTables
(
    DatabaseName sysname,
    SchemaName   sysname,
    TableName    sysname
);

INSERT INTO #IgnoredTables (DatabaseName, SchemaName, TableName)
VALUES
    (N'BIRO225', N'dbo', N'Predracuni'),
    (N'BIRO225', N'dbo', N'Racuni');

CREATE TABLE #Columns
(
    DatabaseName sysname,
    SchemaName   sysname,
    TableName    sysname,
    ColumnName   sysname
);

CREATE TABLE #Matches
(
    DatabaseName sysname,
    SchemaName   sysname,
    TableName    sysname,
    ColumnName   sysname,
    MatchedValue nvarchar(max)
);

DECLARE
    @DatabaseName sysname,
    @SQL          nvarchar(max);

DECLARE database_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT name
FROM sys.databases
WHERE state_desc = N'ONLINE'
  AND HAS_DBACCESS(name) = 1
  AND (
      name LIKE N'BIRO22%'
      OR name = N'Birokrat'
  );

OPEN database_cursor;
FETCH NEXT FROM database_cursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = N'
        INSERT INTO #Columns
        (
            DatabaseName,
            SchemaName,
            TableName,
            ColumnName
        )
        SELECT
            @DatabaseName,
            schemas.name,
            tables.name,
            columns.name
        FROM ' + QUOTENAME(@DatabaseName) + N'.sys.tables AS tables
        INNER JOIN ' + QUOTENAME(@DatabaseName) + N'.sys.schemas AS schemas
            ON schemas.schema_id = tables.schema_id
        INNER JOIN ' + QUOTENAME(@DatabaseName) + N'.sys.columns AS columns
            ON columns.object_id = tables.object_id
        INNER JOIN ' + QUOTENAME(@DatabaseName) + N'.sys.types AS types
            ON types.user_type_id = columns.user_type_id
        WHERE tables.is_ms_shipped = 0
          AND types.name IN
          (
              N''char'', N''varchar'', N''text'',
              N''nchar'', N''nvarchar'', N''ntext''
          );';

    EXEC sys.sp_executesql
        @SQL,
        N'@DatabaseName sysname',
        @DatabaseName;

    FETCH NEXT FROM database_cursor INTO @DatabaseName;
END;

CLOSE database_cursor;
DEALLOCATE database_cursor;

DECLARE
    @SchemaName sysname,
    @TableName  sysname,
    @ColumnName sysname;

DECLARE column_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT
    columns.DatabaseName,
    columns.SchemaName,
    columns.TableName,
    columns.ColumnName
FROM #Columns AS columns
WHERE NOT EXISTS
(
    SELECT 1
    FROM #IgnoredTables AS ignored
    WHERE ignored.DatabaseName = columns.DatabaseName
      AND ignored.SchemaName = columns.SchemaName
      AND ignored.TableName = columns.TableName
)
ORDER BY
    columns.DatabaseName,
    columns.SchemaName,
    columns.TableName,
    columns.ColumnName;

OPEN column_cursor;

FETCH NEXT FROM column_cursor
INTO @DatabaseName, @SchemaName, @TableName, @ColumnName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = N'
        INSERT INTO #Matches
        (
            DatabaseName,
            SchemaName,
            TableName,
            ColumnName,
            MatchedValue
        )
        SELECT
            @DatabaseName,
            @SchemaName,
            @TableName,
            @ColumnName,
            CONVERT(nvarchar(max), ' + QUOTENAME(@ColumnName) + N')
        FROM ' + QUOTENAME(@DatabaseName)
                 + N'.' + QUOTENAME(@SchemaName)
                 + N'.' + QUOTENAME(@TableName) + N'
        WHERE CONVERT(nvarchar(max), ' + QUOTENAME(@ColumnName) + N')
              COLLATE DATABASE_DEFAULT LIKE N''%'' + @SearchText + N''%'';';

    BEGIN TRY
        EXEC sys.sp_executesql
            @SQL,
            N'@SearchText nvarchar(4000),
              @DatabaseName sysname,
              @SchemaName sysname,
              @TableName sysname,
              @ColumnName sysname',
            @SearchText,
            @DatabaseName,
            @SchemaName,
            @TableName,
            @ColumnName;
    END TRY
    BEGIN CATCH
        PRINT CONCAT(
            N'Could not search ',
            QUOTENAME(@DatabaseName), N'.',
            QUOTENAME(@SchemaName), N'.',
            QUOTENAME(@TableName), N'.',
            QUOTENAME(@ColumnName), N': ',
            ERROR_MESSAGE()
        );
    END CATCH;

    FETCH NEXT FROM column_cursor
    INTO @DatabaseName, @SchemaName, @TableName, @ColumnName;
END;

CLOSE column_cursor;
DEALLOCATE column_cursor;

SELECT
    DatabaseName,
    SchemaName,
    TableName,
    ColumnName,
    MatchedValue
FROM #Matches
ORDER BY DatabaseName, SchemaName, TableName, ColumnName;
