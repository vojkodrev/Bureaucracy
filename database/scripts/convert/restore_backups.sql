USE master;
GO

SET NOCOUNT ON;

DECLARE @BackupFolder nvarchar(4000) =
    N'C:\birokatconvert\';

DECLARE @DestinationFolder nvarchar(4000) =
    N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQL\DATA\BIROKRAT\';

CREATE TABLE #BackupFiles
(
    FileName nvarchar(512),
    Depth int,
    IsFile bit
);

INSERT INTO #BackupFiles
EXEC master.sys.xp_dirtree
    @BackupFolder,
    1,
    1;

DECLARE @DatabaseName sysname;
DECLARE @BackupFile nvarchar(4000);
DECLARE @DataFile nvarchar(4000);
DECLARE @LogFile nvarchar(4000);
DECLARE @Sql nvarchar(max);

DECLARE RestoreCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT LEFT(FileName, LEN(FileName) - 4)
FROM #BackupFiles
WHERE IsFile = 1
  AND FileName LIKE N'BIRO[0-9]%.bak'
  AND SUBSTRING(
        LEFT(FileName, LEN(FileName) - 4),
        5,
        128
      ) NOT LIKE N'%[^0-9]%'
ORDER BY FileName;

OPEN RestoreCursor;
FETCH NEXT FROM RestoreCursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @BackupFile =
        @BackupFolder + @DatabaseName + N'.bak';

    SET @DataFile =
        @DestinationFolder + @DatabaseName + N'.mdf';

    SET @LogFile =
        @DestinationFolder + @DatabaseName + N'_log.LDF';

    /*
      This assumes the logical names follow the convention shown:

          BIRO201
          BIRO201_log
    */
    SET @Sql =
        N'RESTORE DATABASE ' + QUOTENAME(@DatabaseName) + N'
          FROM DISK = N''' +
              REPLACE(@BackupFile, N'''', N'''''') + N'''
          WITH
              MOVE N''' +
                  REPLACE(@DatabaseName, N'''', N'''''') +
                  N''' TO N''' +
                  REPLACE(@DataFile, N'''', N'''''') + N''',
              MOVE N''' +
                  REPLACE(@DatabaseName + N'_log', N'''', N'''''') +
                  N''' TO N''' +
                  REPLACE(@LogFile, N'''', N'''''') + N''',
              RECOVERY,
              CHECKSUM,
              STATS = 10;';

    BEGIN TRY
        RAISERROR(
            N'Restoring database: %s',
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
            N'Restore failed for ' +
            QUOTENAME(@DatabaseName) +
            N': ' + ERROR_MESSAGE();

        RAISERROR(
            N'%s',
            10,
            1,
            @ErrorMessage
        ) WITH NOWAIT;
    END CATCH;

    FETCH NEXT FROM RestoreCursor INTO @DatabaseName;
END;

CLOSE RestoreCursor;
DEALLOCATE RestoreCursor;

DROP TABLE #BackupFiles;
GO