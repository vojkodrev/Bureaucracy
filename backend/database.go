package main

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/microsoft/go-mssqldb"
	"go.uber.org/fx"
)

func NewDatabase(config *AppConfig) (*sql.DB, error) {
	database, err := sql.Open("sqlserver", config.MSSQLConnectionString())
	if err != nil {
		return nil, err
	}

	database.SetConnMaxLifetime(30 * time.Minute)
	database.SetMaxIdleConns(5)
	database.SetMaxOpenConns(10)
	return database, nil
}

func RegisterDatabaseLifecycle(lifecycle fx.Lifecycle, database *sql.DB) {
	lifecycle.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			return database.PingContext(ctx)
		},
		OnStop: func(_ context.Context) error {
			return database.Close()
		},
	})
}
