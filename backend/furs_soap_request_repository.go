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

func (repository *FURSSOAPRequestRepository) Save(ctx context.Context, request FURSSOAPRequest) error {
	_, err := repository.database.ExecContext(ctx, `INSERT INTO [Bureaucracy].[dbo].[furs_soap_requests]
		(business_year_id, invoice_id, invoice_number, request_url, soap_action, payload)
		VALUES (@businessYearID, @invoiceID, @invoiceNumber, @requestURL, @soapAction, @payload)`,
		sql.Named("businessYearID", request.BusinessYearID),
		sql.Named("invoiceID", request.InvoiceID),
		sql.Named("invoiceNumber", request.InvoiceNumber),
		sql.Named("requestURL", request.RequestURL),
		sql.Named("soapAction", request.SOAPAction),
		sql.Named("payload", request.Payload),
	)
	if err != nil {
		return fmt.Errorf("save FURS SOAP request: %w", err)
	}
	return nil
}
