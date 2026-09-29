package main

import (
	"bufio"
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log/slog"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"go.uber.org/fx"
)

const migrationDirectory = "migration/db"

var (
	//go:embed migration/db/*.sql
	migrationFiles           embed.FS
	migrationFilenamePattern = regexp.MustCompile(`^(\d{5})_([a-z0-9_]+)\.sql$`)
	batchSeparatorPattern    = regexp.MustCompile(`(?i)^\s*GO\s*$`)
)

type DatabaseMigration struct {
	Version int64
	Name    string
	Path    string
	SQL     string
}

type DatabaseMigrator struct {
	database   *sql.DB
	migrations []DatabaseMigration
}

func NewDatabaseMigrator(database *sql.DB) (*DatabaseMigrator, error) {
	migrations, err := loadDatabaseMigrations(migrationFiles)
	if err != nil {
		return nil, err
	}

	return &DatabaseMigrator{database: database, migrations: migrations}, nil
}

func RegisterDatabaseMigrationLifecycle(lifecycle fx.Lifecycle, migrator *DatabaseMigrator) {
	lifecycle.Append(fx.Hook{OnStart: migrator.Migrate})
}

func (migrator *DatabaseMigrator) Migrate(ctx context.Context) error {
	connection, err := migrator.database.Conn(ctx)
	if err != nil {
		return fmt.Errorf("open migration connection: %w", err)
	}
	defer connection.Close()

	var migrationDatabaseExists bool
	if err := connection.QueryRowContext(ctx, `SELECT CAST(CASE WHEN DB_ID(N'Bureaucracy') IS NULL THEN 0 ELSE 1 END AS bit);`).Scan(&migrationDatabaseExists); err != nil {
		return fmt.Errorf("check migration database: %w", err)
	}
	if migrationDatabaseExists {
		if _, err := connection.ExecContext(ctx, `USE [Bureaucracy];`); err != nil {
			return fmt.Errorf("select migration database: %w", err)
		}
	}

	for _, migration := range migrator.migrations {
		applied, err := isMigrationApplied(ctx, connection, migration.Version)
		if err != nil {
			return fmt.Errorf("check migration %s: %w", migration.Path, err)
		}
		if applied {
			continue
		}

		for batchNumber, batch := range splitSQLServerBatches(migration.SQL) {
			if _, err := connection.ExecContext(ctx, batch); err != nil {
				return fmt.Errorf("apply migration %s batch %d: %w", migration.Path, batchNumber+1, err)
			}
		}

		if _, err := connection.ExecContext(ctx, `
INSERT INTO [Bureaucracy].[dbo].[schema_migrations] ([version], [name])
VALUES (@version, @name);`,
			sql.Named("version", migration.Version),
			sql.Named("name", migration.Name),
		); err != nil {
			return fmt.Errorf("record migration %s: %w", migration.Path, err)
		}

		slog.Info("database migration applied", "version", migration.Version, "name", migration.Name)
	}

	return nil
}

func isMigrationApplied(ctx context.Context, connection *sql.Conn, version int64) (bool, error) {
	// Dynamic SQL prevents SQL Server from resolving the database or table before
	// the bootstrap migration has created them.
	const query = `
IF DB_ID(N'Bureaucracy') IS NULL
    SELECT CAST(0 AS bit);
ELSE IF OBJECT_ID(N'[Bureaucracy].[dbo].[schema_migrations]', N'U') IS NULL
    SELECT CAST(0 AS bit);
ELSE
    EXEC sp_executesql
        N'SELECT CAST(CASE WHEN EXISTS (
            SELECT 1 FROM [Bureaucracy].[dbo].[schema_migrations] WHERE [version] = @migration_version
        ) THEN 1 ELSE 0 END AS bit)',
        N'@migration_version bigint',
        @migration_version = @version;`

	var applied bool
	if err := connection.QueryRowContext(ctx, query, sql.Named("version", version)).Scan(&applied); err != nil {
		return false, err
	}
	return applied, nil
}

func loadDatabaseMigrations(files fs.FS) ([]DatabaseMigration, error) {
	entries, err := fs.ReadDir(files, migrationDirectory)
	if err != nil {
		return nil, fmt.Errorf("read database migrations: %w", err)
	}

	migrations := make([]DatabaseMigration, 0, len(entries))
	versions := make(map[int64]string, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		matches := migrationFilenamePattern.FindStringSubmatch(entry.Name())
		if matches == nil {
			return nil, fmt.Errorf("invalid migration filename %q; expected 00001_description.sql", entry.Name())
		}
		version, err := strconv.ParseInt(matches[1], 10, 64)
		if err != nil {
			return nil, fmt.Errorf("parse migration version in %q: %w", entry.Name(), err)
		}
		if existing, duplicate := versions[version]; duplicate {
			return nil, fmt.Errorf("migration version %05d is used by both %q and %q", version, existing, entry.Name())
		}

		migrationPath := path.Join(migrationDirectory, entry.Name())
		contents, err := fs.ReadFile(files, migrationPath)
		if err != nil {
			return nil, fmt.Errorf("read migration %q: %w", entry.Name(), err)
		}
		versions[version] = entry.Name()
		migrations = append(migrations, DatabaseMigration{
			Version: version,
			Name:    matches[2],
			Path:    migrationPath,
			SQL:     string(contents),
		})
	}

	sort.Slice(migrations, func(i, j int) bool { return migrations[i].Version < migrations[j].Version })
	return migrations, nil
}

func splitSQLServerBatches(script string) []string {
	var batches []string
	var batch strings.Builder
	scanner := bufio.NewScanner(strings.NewReader(script))
	for scanner.Scan() {
		if batchSeparatorPattern.MatchString(scanner.Text()) {
			if sqlBatch := strings.TrimSpace(batch.String()); sqlBatch != "" {
				batches = append(batches, sqlBatch)
			}
			batch.Reset()
			continue
		}
		batch.WriteString(scanner.Text())
		batch.WriteByte('\n')
	}
	if sqlBatch := strings.TrimSpace(batch.String()); sqlBatch != "" {
		batches = append(batches, sqlBatch)
	}
	return batches
}
