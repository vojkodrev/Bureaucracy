package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type InvoiceTaxConfirmation struct {
	BusinessYearID int       `json:"businessYearId"`
	InvoiceID      int       `json:"invoiceId"`
	InvoiceNumber  string    `json:"invoiceNumber"`
	IssueDateTime  time.Time `json:"issueDateTime"`
	ZOI            string    `json:"zoi"`
	EOR            string    `json:"eor"`
}

type InvoiceTaxConfirmationRepository struct{ database *sql.DB }

func NewInvoiceTaxConfirmationRepository(database *sql.DB) *InvoiceTaxConfirmationRepository {
	return &InvoiceTaxConfirmationRepository{database: database}
}

func (r *InvoiceTaxConfirmationRepository) Get(ctx context.Context, businessYearID, invoiceID int) (*InvoiceTaxConfirmation, error) {
	value := &InvoiceTaxConfirmation{}
	err := r.database.QueryRowContext(ctx, `SELECT business_year_id, invoice_id, invoice_number, furs_issue_date_time, zoi, eor
		FROM [Bureaucracy].[dbo].[invoice_details]
		WHERE business_year_id=@businessYearID AND invoice_id=@invoiceID`,
		sql.Named("businessYearID", businessYearID), sql.Named("invoiceID", invoiceID)).Scan(
		&value.BusinessYearID, &value.InvoiceID, &value.InvoiceNumber, &value.IssueDateTime, &value.ZOI, &value.EOR)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get invoice tax confirmation: %w", err)
	}
	return value, nil
}

func (r *InvoiceTaxConfirmationRepository) Save(ctx context.Context, value *InvoiceTaxConfirmation) error {
	_, err := r.database.ExecContext(ctx, `INSERT INTO [Bureaucracy].[dbo].[invoice_details]
		(business_year_id, invoice_id, invoice_number, furs_issue_date_time, zoi, eor)
		VALUES (@businessYearID, @invoiceID, @invoiceNumber, @issueDateTime, @zoi, @eor)`,
		sql.Named("businessYearID", value.BusinessYearID), sql.Named("invoiceID", value.InvoiceID),
		sql.Named("invoiceNumber", value.InvoiceNumber), sql.Named("issueDateTime", value.IssueDateTime),
		sql.Named("zoi", value.ZOI), sql.Named("eor", value.EOR))
	if err != nil {
		return fmt.Errorf("save invoice tax confirmation: %w", err)
	}
	return nil
}
