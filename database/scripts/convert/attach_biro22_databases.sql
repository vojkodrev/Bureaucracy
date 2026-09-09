USE master;
GO

SET NOCOUNT ON;

DECLARE @DataFolder nvarchar(4000);
SET @DataFolder =
    N'C:\Program Files\Microsoft SQL Server\MSSQL10_50.SQLEXPRESS2008\MSSQL\DATA\BIROKRAT\';

CREATE TABLE #DatabaseFiles
(
    FileName nvarchar(512),
    Depth int,
    IsFile bit
);

INSERT INTO #DatabaseFiles
EXEC master.sys.xp_dirtree
    @DataFolder,
    1,
    1;

DECLARE @DatabaseName sysname;
DECLARE @DataFileName nvarchar(512);
DECLARE @LogFileName nvarchar(512);
DECLARE @DataFile nvarchar(4000);
DECLARE @LogFile nvarchar(4000);
DECLARE @Sql nvarchar(max);
DECLARE @ErrorMessage nvarchar(4000);

DECLARE DatabaseCursor CURSOR LOCAL FAST_FORWARD FOR
SELECT
    LEFT(FileName, LEN(FileName) - 4),
    FileName
FROM #DatabaseFiles
WHERE IsFile = 1
  AND FileName LIKE N'BIRO22[0-9]%.mdf'
  AND SUBSTRING(
        LEFT(FileName, LEN(FileName) - 4),
        5,
        128
      ) NOT LIKE N'%[^0-9]%'
ORDER BY FileName;

OPEN DatabaseCursor;
FETCH NEXT FROM DatabaseCursor
INTO @DatabaseName, @DataFileName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @LogFileName = NULL;

    SELECT TOP (1)
        @LogFileName = FileName
    FROM #DatabaseFiles
    WHERE IsFile = 1
      AND (
          FileName = @DatabaseName + N'_log.ldf'
          OR FileName = @DatabaseName + N'.ldf'
      )
    ORDER BY
        CASE
            WHEN FileName = @DatabaseName + N'_log.ldf' THEN 0
            ELSE 1
        END;

    IF DB_ID(@DatabaseName) IS NOT NULL
    BEGIN
        RAISERROR(
            N'Skipping database that is already attached: %s',
            0,
            1,
            @DatabaseName
        ) WITH NOWAIT;
    END
    ELSE IF @LogFileName IS NULL
    BEGIN
        RAISERROR(
            N'Skipping %s because no matching LDF file was found.',
            10,
            1,
            @DatabaseName
        ) WITH NOWAIT;
    END
    ELSE
    BEGIN
        SET @DataFile = @DataFolder + @DataFileName;
        SET @LogFile = @DataFolder + @LogFileName;

        SET @Sql =
            N'CREATE DATABASE ' + QUOTENAME(@DatabaseName) + N'
              ON
              (FILENAME = N''' +
                  REPLACE(@DataFile, N'''', N'''''') + N'''),
              (FILENAME = N''' +
                  REPLACE(@LogFile, N'''', N'''''') + N''')
              FOR ATTACH;';

        BEGIN TRY
            RAISERROR(
                N'Attaching database: %s',
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
            SET @ErrorMessage =
                N'Attach failed for ' + QUOTENAME(@DatabaseName) +
                N': ' + ERROR_MESSAGE();

            RAISERROR(
                N'%s',
                10,
                1,
                @ErrorMessage
            ) WITH NOWAIT;
        END CATCH;
    END;

    FETCH NEXT FROM DatabaseCursor
    INTO @DatabaseName, @DataFileName;
END;

CLOSE DatabaseCursor;
DEALLOCATE DatabaseCursor;

DROP TABLE #DatabaseFiles;
GO
