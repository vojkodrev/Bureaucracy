SET NOCOUNT ON;

DECLARE
    @schema_name sysname,
    @table_name sysname,
    @object_id int,
    @column_list nvarchar(max),
    @sql nvarchar(max),
    @row_count bigint;

DECLARE table_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT s.name, t.name, t.object_id
    FROM sys.tables AS t
    INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
    WHERE t.is_ms_shipped = 0
    ORDER BY s.name, t.name;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @schema_name, @table_name, @object_id;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '@@TABLE' + CHAR(9) + @schema_name + CHAR(9) + @table_name;

    SET @sql = N'SELECT @count = COUNT_BIG(*) FROM '
        + QUOTENAME(@schema_name) + N'.' + QUOTENAME(@table_name) + N';';
    EXEC sys.sp_executesql @sql, N'@count bigint OUTPUT', @count = @row_count OUTPUT;
    PRINT '@@COUNT' + CHAR(9) + CONVERT(varchar(30), @row_count);

    SELECT @column_list = STRING_AGG(
        CONVERT(nvarchar(max),
            N'(N''' + REPLACE(c.name, N'''', N'''''') + N''', '
            + CASE
                WHEN ty.name IN ('binary', 'varbinary', 'image', 'timestamp', 'rowversion') THEN
                    N'CASE WHEN ' + QUOTENAME(c.name) + N' IS NULL THEN N''@@NULL'' ELSE CONCAT(N''<binary '', DATALENGTH('
                    + QUOTENAME(c.name) + N'), N'' bytes>'') END'
                ELSE
                    N'CASE WHEN ' + QUOTENAME(c.name) + N' IS NULL THEN N''@@NULL'' ELSE LEFT(REPLACE(REPLACE(REPLACE('
                    + N'CONVERT(nvarchar(max), ' + QUOTENAME(c.name) + N'), CHAR(9), N'' ''), CHAR(13), N'' ''), CHAR(10), N'' ''), 200) END'
            END
            + N')'
        ),
        N', '
    )
    FROM sys.columns AS c
    INNER JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
    WHERE c.object_id = @object_id;

    BEGIN TRY
        SET @sql = N';WITH sample_rows AS ('
            + N'SELECT TOP (5) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS __doc_row_number, * '
            + N'FROM ' + QUOTENAME(@schema_name) + N'.' + QUOTENAME(@table_name) + N') '
            + N'SELECT CONVERT(varchar(10), __doc_row_number), sample_values.column_name, sample_values.sample_value '
            + N'FROM sample_rows CROSS APPLY (VALUES ' + @column_list + N') '
            + N'AS sample_values(column_name, sample_value) ORDER BY __doc_row_number;';
        EXEC sys.sp_executesql @sql;
    END TRY
    BEGIN CATCH
        PRINT '@@ERROR' + CHAR(9) + REPLACE(REPLACE(ERROR_MESSAGE(), CHAR(13), ' '), CHAR(10), ' ');
    END CATCH;

    PRINT '@@END';
    FETCH NEXT FROM table_cursor INTO @schema_name, @table_name, @object_id;
END;

CLOSE table_cursor;
DEALLOCATE table_cursor;
