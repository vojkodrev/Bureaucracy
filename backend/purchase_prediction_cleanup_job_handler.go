package main

import (
	"context"
	"database/sql"
	"fmt"
)

const purchasePredictionCleanupJobName = "purchase_prediction_cleanup"

type PurchasePredictionCleanupJobHandler struct{ database *sql.DB }

func NewPurchasePredictionCleanupJobHandler(database *sql.DB) *PurchasePredictionCleanupJobHandler {
	return &PurchasePredictionCleanupJobHandler{database: database}
}

func (handler *PurchasePredictionCleanupJobHandler) Name() string {
	return purchasePredictionCleanupJobName
}

func (handler *PurchasePredictionCleanupJobHandler) Handle(ctx context.Context) error {
	_, err := handler.database.ExecContext(ctx, `
DELETE FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT TOP (3) id
        FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
        ORDER BY as_of_date DESC, created_at_utc DESC, id DESC
    ) latest_runs
);`)
	if err != nil {
		return fmt.Errorf("remove old purchase prediction runs: %w", err)
	}
	return nil
}
