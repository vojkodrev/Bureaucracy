USE master;
GO

SET NOCOUNT ON;

DECLARE @DatabaseName sysname;
DECLARE @Sql nvarchar(max);

DECLARE DatabaseCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT name
FROM sys.databases
WHERE name LIKE N'BIRO22%'
  AND source_database_id IS NULL
ORDER BY name;

OPEN DatabaseCursor;
FETCH NEXT FROM DatabaseCursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @Sql =
        N'ALTER DATABASE ' + QUOTENAME(@DatabaseName) +
        N' SET SINGLE_USER WITH ROLLBACK IMMEDIATE;' +
        N'DROP DATABASE ' + QUOTENAME(@DatabaseName) + N';';

    BEGIN TRY
        RAISERROR(
            N'Deleting database: %s',
            0,
            1,
            @DatabaseName
        ) WITH NOWAIT;

        EXEC sys.sp_executesql @Sql;

        RAISERROR(
            N'Completed: %s',
            0,
            1,
            @DatabaseName
        ) WITH NOWAIT;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage nvarchar(4000);

        SET @ErrorMessage =
            N'Delete failed for ' + QUOTENAME(@DatabaseName) +
            N': ' + ERROR_MESSAGE();

        RAISERROR(N'%s', 10, 1, @ErrorMessage) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM DatabaseCursor INTO @DatabaseName;
END;

CLOSE DatabaseCursor;
DEALLOCATE DatabaseCursor;
GO
