package main

import (
	"context"
	"database/sql"
	"fmt"
)

type FURSSOAPRequest struct {
	BusinessYearID int
	InvoiceID      int
	InvoiceNumber  string
	RequestURL     string
	SOAPAction     string
	Payload        string
}

type FURSSOAPRequestRepository struct{ database *sql.DB }

func NewFURSSOAPRequestRepository(database *sql.DB) *FURSSOAPRequestRepository {
	return &FURSSOAPRequestRepository{database: database}
}

func (repository *FURSSOAPRequestRepository) Create(ctx context.Context, request FURSSOAPRequest) (int64, error) {
	var id int64
	err := repository.database.QueryRowContext(ctx, `INSERT INTO [Bureaucracy].[dbo].[furs_soap_requests]
		(business_year_id, invoice_id, invoice_number, request_url, soap_action, payload)
		OUTPUT INSERTED.id
		VALUES (@businessYearID, @invoiceID, @invoiceNumber, @requestURL, @soapAction, @payload)`,
		sql.Named("businessYearID", request.BusinessYearID),
		sql.Named("invoiceID", request.InvoiceID),
		sql.Named("invoiceNumber", request.InvoiceNumber),
		sql.Named("requestURL", request.RequestURL),
		sql.Named("soapAction", request.SOAPAction),
		sql.Named("payload", request.Payload),
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("create FURS SOAP request: %w", err)
	}
	return id, nil
}

func (repository *FURSSOAPRequestRepository) SaveResponse(ctx context.Context, id int64, statusCode int, payload string) error {
	result, err := repository.database.ExecContext(ctx, `UPDATE [Bureaucracy].[dbo].[furs_soap_requests]
		SET response_status_code=@statusCode, response_payload=@payload, responded_at=SYSUTCDATETIME()
		WHERE id=@id`,
		sql.Named("id", id),
		sql.Named("statusCode", statusCode),
		sql.Named("payload", payload),
	)
	if err != nil {
		return fmt.Errorf("save FURS SOAP response: %w", err)
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("check saved FURS SOAP response: %w", err)
	}
	if affected != 1 {
		return fmt.Errorf("FURS SOAP request %d was not found", id)
	}
	return nil
}
