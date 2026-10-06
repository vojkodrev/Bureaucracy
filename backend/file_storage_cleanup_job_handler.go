package main

import (
	"context"
	"database/sql"
	"fmt"
)

const fileStorageCleanupJobName = "file_storage_cleanup"

type FileStorageCleanupJobHandler struct{ database *sql.DB }

func NewFileStorageCleanupJobHandler(database *sql.DB) *FileStorageCleanupJobHandler {
	return &FileStorageCleanupJobHandler{database: database}
}

func (handler *FileStorageCleanupJobHandler) Name() string {
	return fileStorageCleanupJobName
}

func (handler *FileStorageCleanupJobHandler) Handle(ctx context.Context) error {
	// Uploads are stored before a goods receipt is saved. Keep recent orphaned
	// files so an upload that is still being attached cannot be removed.
	_, err := handler.database.ExecContext(ctx, `
DELETE stored
FROM [Bureaucracy].[dbo].[file_storage] stored
WHERE stored.created_at < DATEADD(day, -1, SYSUTCDATETIME())
  AND NOT EXISTS (
      SELECT 1
      FROM [Bureaucracy].[dbo].[goods_receipt_item_photos] photo
      WHERE photo.file_id = stored.id
  );`)
	if err != nil {
		return fmt.Errorf("remove stale files from database storage: %w", err)
	}
	return nil
}
