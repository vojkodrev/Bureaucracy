package main

import (
	"context"
	"database/sql"
	"fmt"
)

type StorageRepository struct{ database *sql.DB }

func NewStorageRepository(database *sql.DB) *StorageRepository {
	return &StorageRepository{database: database}
}

func (repository *StorageRepository) List(ctx context.Context) ([]*Storage, error) {
	rows, err := repository.database.QueryContext(ctx, `
		SELECT RTRIM([code]), [description]
		FROM [Bureaucracy].[dbo].[storages]
		ORDER BY [code]`)
	if err != nil {
		return nil, fmt.Errorf("list storages: %w", err)
	}
	defer rows.Close()

	storages := make([]*Storage, 0)
	for rows.Next() {
		storage := &Storage{}
		if err := rows.Scan(&storage.Code, &storage.Description); err != nil {
			return nil, fmt.Errorf("scan storage: %w", err)
		}
		storages = append(storages, storage)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read storages: %w", err)
	}
	return storages, nil
}
