USE master;
GO

DECLARE @DatabaseName sysname;
DECLARE @BackupFile nvarchar(4000);
DECLARE @Sql nvarchar(max);

DECLARE DatabaseCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT name
FROM sys.databases
WHERE name LIKE N'BIRO[0-9]%'
  AND SUBSTRING(name, 5, 128) NOT LIKE N'%[^0-9]%'
  AND state_desc = N'ONLINE'
  AND source_database_id IS NULL
ORDER BY name;

OPEN DatabaseCursor;
FETCH NEXT FROM DatabaseCursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @BackupFile =
        N'C:\birokatconvert\' +
        @DatabaseName +
        N'.bak';

    SET @Sql =
        N'BACKUP DATABASE ' + QUOTENAME(@DatabaseName) +
        N' TO DISK = N''' +
        REPLACE(@BackupFile, N'''', N'''''') +
        N''' WITH COPY_ONLY, INIT, CHECKSUM, STATS = 10;';

    BEGIN TRY
        RAISERROR(
            N'Backing up database: %s',
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
            N'Backup failed for ' + QUOTENAME(@DatabaseName) +
            N': ' + ERROR_MESSAGE();

        RAISERROR(N'%s', 10, 1, @ErrorMessage) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM DatabaseCursor INTO @DatabaseName;
END;

CLOSE DatabaseCursor;
DEALLOCATE DatabaseCursor;
GO