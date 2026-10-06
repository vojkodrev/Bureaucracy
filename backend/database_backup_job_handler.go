package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

const databaseBackupJobName = "database_backup"

type DatabaseBackupJobHandler struct {
	database     *sql.DB
	backupFolder string
}

func NewDatabaseBackupJobHandler(database *sql.DB, config *AppConfig) *DatabaseBackupJobHandler {
	return &DatabaseBackupJobHandler{database: database, backupFolder: config.MSSQLBackupFolder}
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
		backupPath := joinPlatformPath(handler.backupFolder, safeFilenamePart(databaseName, "database")+".bak")
		if _, err := handler.database.ExecContext(ctx, `
DECLARE @statement nvarchar(max) =
    N'BACKUP DATABASE ' + QUOTENAME(@database_name) +
    N' TO DISK = @path WITH NOINIT, CHECKSUM';
EXEC sys.sp_executesql
    @statement,
    N'@path nvarchar(4000)',
    @path = @backup_path;`,
			sql.Named("database_name", databaseName),
			sql.Named("backup_path", backupPath),
		); err != nil {
			return fmt.Errorf("back up database %q to %q: %w", databaseName, backupPath, err)
		}
	}

	return nil
}

func (handler *DatabaseBackupJobHandler) ensureBackupFolder(ctx context.Context) error {
	if _, err := handler.database.ExecContext(ctx, `
DECLARE @file_exists int = 0;
DECLARE @parent_directory_exists int = 0;
DECLARE @is_directory int = 0;
EXEC master.dbo.xp_fileexist
    @backup_folder,
    @file_exists OUTPUT,
    @parent_directory_exists OUTPUT,
    @is_directory OUTPUT;

IF @is_directory = 0
    EXEC master.dbo.xp_create_subdir @backup_folder;`,
		sql.Named("backup_folder", handler.backupFolder),
	); err != nil {
		return fmt.Errorf("ensure backup folder %q exists: %w", handler.backupFolder, err)
	}
	return nil
}
