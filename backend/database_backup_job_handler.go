package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

const databaseBackupJobName = "database_backup"

type DatabaseBackupJobHandler struct {
	database     *sql.DB
	backupFolder string
}

func NewDatabaseBackupJobHandler(database *sql.DB, config *AppConfig) *DatabaseBackupJobHandler {
	return &DatabaseBackupJobHandler{database: database, backupFolder: normalizePlatformPath(config.MSSQLBackupFolder)}
}

func (handler *DatabaseBackupJobHandler) Name() string {
	return databaseBackupJobName
}

func (handler *DatabaseBackupJobHandler) Handle(ctx context.Context) error {
	if strings.TrimSpace(handler.backupFolder) == "" {
		return fmt.Errorf("MSSQL_BACKUP_FOLDER is not configured")
	}
	if err := handler.ensureBackupFolder(ctx); err != nil {
		return err
	}

	rows, err := handler.database.QueryContext(ctx, `
SELECT [name]
FROM sys.databases
WHERE database_id > 4
  AND [state] = 0
  AND source_database_id IS NULL
ORDER BY [name];`)
	if err != nil {
		return fmt.Errorf("list databases for backup: %w", err)
	}

	var databaseNames []string
	for rows.Next() {
		var databaseName string
		if err := rows.Scan(&databaseName); err != nil {
			rows.Close()
			return fmt.Errorf("read database name for backup: %w", err)
		}
		databaseNames = append(databaseNames, databaseName)
	}
	if err := rows.Close(); err != nil {
		return fmt.Errorf("close database list: %w", err)
	}
	if err := rows.Err(); err != nil {
		return fmt.Errorf("iterate databases for backup: %w", err)
	}

	for _, databaseName := range databaseNames {
		filename := safeFilenamePart(databaseName, "database")
		fullBackupPath := joinPlatformPath(handler.backupFolder, filename+".bak")
		differentialBackupPath := joinPlatformPath(handler.backupFolder, filename+".diff.bak")
		makeFullBackup := time.Now().Weekday() == time.Sunday
		hasDifferentialForCurrentFull := false
		if !makeFullBackup {
			var hasFullBackup bool
			if err := handler.database.QueryRowContext(ctx, `
DECLARE @latest_full_media_set_id int;
DECLARE @latest_full_checkpoint_lsn numeric(25, 0);

SELECT TOP (1)
    @latest_full_media_set_id = backup_set.media_set_id,
    @latest_full_checkpoint_lsn = backup_set.checkpoint_lsn
FROM msdb.dbo.backupset AS backup_set
WHERE backup_set.database_name = @database_name
  AND backup_set.[type] = 'D'
  AND backup_set.is_copy_only = 0
ORDER BY backup_set.backup_finish_date DESC, backup_set.backup_set_id DESC;

SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM msdb.dbo.backupmediafamily AS media
    WHERE media.media_set_id = @latest_full_media_set_id
      AND media.physical_device_name = @full_backup_path
) THEN 1 ELSE 0 END,
    CASE WHEN EXISTS (
    SELECT 1
    FROM msdb.dbo.backupset AS backup_set
    INNER JOIN msdb.dbo.backupmediafamily AS media
        ON media.media_set_id = backup_set.media_set_id
    WHERE backup_set.database_name = @database_name
      AND backup_set.[type] = 'I'
      AND backup_set.database_backup_lsn = @latest_full_checkpoint_lsn
      AND media.physical_device_name = @differential_backup_path
) THEN 1 ELSE 0 END;`,
				sql.Named("database_name", databaseName),
				sql.Named("full_backup_path", fullBackupPath),
				sql.Named("differential_backup_path", differentialBackupPath),
			).Scan(&hasFullBackup, &hasDifferentialForCurrentFull); err != nil {
				return fmt.Errorf("check full backup for database %q: %w", databaseName, err)
			}
			makeFullBackup = !hasFullBackup
		}

		backupPath := differentialBackupPath
		backupOptions := "DIFFERENTIAL, CHECKSUM"
		if makeFullBackup {
			backupPath = fullBackupPath
			backupOptions = "INIT, CHECKSUM"
		} else if !hasDifferentialForCurrentFull {
			backupOptions = "DIFFERENTIAL, INIT, CHECKSUM"
		}
		if _, err := handler.database.ExecContext(ctx, `
DECLARE @statement nvarchar(max) =
    N'BACKUP DATABASE ' + QUOTENAME(@database_name) +
    N' TO DISK = @path WITH ' + @options;
EXEC sys.sp_executesql
    @statement,
    N'@path nvarchar(4000)',
    @path = @backup_path;`,
			sql.Named("database_name", databaseName),
			sql.Named("backup_path", backupPath),
			sql.Named("options", backupOptions),
		); err != nil {
			return fmt.Errorf("back up database %q to %q: %w", databaseName, backupPath, err)
		}
	}

	return nil
}

func (handler *DatabaseBackupJobHandler) ensureBackupFolder(ctx context.Context) error {
	if _, err := handler.database.ExecContext(ctx, `
CREATE TABLE #backup_path_info (
    file_exists int,
    is_directory int,
    parent_directory_exists int
);

INSERT INTO #backup_path_info
EXEC master.dbo.xp_fileexist @backup_folder;

IF NOT EXISTS (SELECT 1 FROM #backup_path_info WHERE is_directory = 1)
    EXEC master.dbo.xp_create_subdir @backup_folder;`,
		sql.Named("backup_folder", handler.backupFolder),
	); err != nil {
		return fmt.Errorf("ensure backup folder %q exists: %w", handler.backupFolder, err)
	}
	return nil
}
