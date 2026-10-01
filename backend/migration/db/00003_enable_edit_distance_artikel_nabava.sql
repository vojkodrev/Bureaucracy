USE master;
GO

SET NOCOUNT ON;

DECLARE
    @DatabaseName sysname,
    @Sql nvarchar(max),
    @HasPurchaseProducts bit;

DECLARE database_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT name
FROM sys.databases
WHERE name LIKE N'BIRO[0-9][0-9]3'
  AND LEN(name) = 7
  AND state_desc = N'ONLINE'
  AND source_database_id IS NULL
  AND HAS_DBACCESS(name) = 1
ORDER BY name;

OPEN database_cursor;
FETCH NEXT FROM database_cursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    BEGIN TRY
        SET @HasPurchaseProducts = 0;
        SET @Sql = N'USE ' + QUOTENAME(@DatabaseName) + N';
            IF OBJECT_ID(N''dbo.ArtikelNabava'', N''U'') IS NOT NULL
            BEGIN
                DECLARE @CheckSql nvarchar(max);
                SET @CheckSql = N''IF EXISTS (SELECT 1 FROM dbo.ArtikelNabava)
                    SET @ContainsPurchaseProducts = 1;'';
                EXEC sys.sp_executesql
                    @CheckSql,
                    N''@ContainsPurchaseProducts bit OUTPUT'',
                    @ContainsPurchaseProducts = @DatabaseHasPurchaseProducts OUTPUT;
            END;';
        EXEC sys.sp_executesql
            @Sql,
            N'@DatabaseHasPurchaseProducts bit OUTPUT',
            @DatabaseHasPurchaseProducts = @HasPurchaseProducts OUTPUT;

        IF @HasPurchaseProducts = 1
        BEGIN
            SET @Sql = N'USE ' + QUOTENAME(@DatabaseName) + N';
                ALTER DATABASE SCOPED CONFIGURATION SET PREVIEW_FEATURES = ON;';
            EXEC sys.sp_executesql @Sql;
            RAISERROR(N'Enabled EDIT_DISTANCE for ArtikelNabava in %s.', 0, 1, @DatabaseName) WITH NOWAIT;
        END;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage nvarchar(4000);
        SET @ErrorMessage = N'Could not enable EDIT_DISTANCE for ArtikelNabava in ' +
            QUOTENAME(@DatabaseName) + N': ' + ERROR_MESSAGE();
        RAISERROR(N'%s', 10, 1, @ErrorMessage) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM database_cursor INTO @DatabaseName;
END;

CLOSE database_cursor;
DEALLOCATE database_cursor;
GO
