package main

import (
	"context"
	"database/sql"
	"fmt"
)

const purchasePredictionCleanupJobName = "purchase_prediction_cleanup"

type PurchasePredictionCleanupJobHandler struct {
	database   *sql.DB
	runsToKeep int
}

func NewPurchasePredictionCleanupJobHandler(database *sql.DB, config *AppConfig) *PurchasePredictionCleanupJobHandler {
	return &PurchasePredictionCleanupJobHandler{
		database:   database,
		runsToKeep: config.PurchasePredictionRunsToKeep,
	}
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
        SELECT TOP (@runs_to_keep) id
        FROM [Bureaucracy].[dbo].[purchase_prediction_runs]
        ORDER BY as_of_date DESC, created_at_utc DESC, id DESC
    ) latest_runs
);`, sql.Named("runs_to_keep", handler.runsToKeep))
	if err != nil {
		return fmt.Errorf("remove old purchase prediction runs: %w", err)
	}
	return nil
}
