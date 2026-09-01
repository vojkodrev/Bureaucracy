package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type InvoiceRepository struct {
	database *sql.DB
}

func NewInvoiceRepository(database *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{database: database}
}

func (repository *InvoiceRepository) SearchByNumber(ctx context.Context, number string, limit int) ([]*Invoice, error) {
	number = strings.TrimSpace(number)
	if number == "" {
		return nil, fmt.Errorf("invoice number must not be empty")
	}
	if limit < 1 || limit > 100 {
		return nil, fmt.Errorf("limit must be between 1 and 100")
	}

	rows, err := repository.database.QueryContext(ctx, `
		SELECT TOP (@limit)
			RecNo,
			COALESCE(Stevilka, ''),
			DatumIzstavitve,
			DatumDUR,
			DatumZapadlosti,
			DatumPlacila,
			SifraPartnerja,
			ImePartnerja,
			NaslovPartnerja,
			KrajPartnerja,
			KontaktPartnerja,
			Valuta,
			Znesek,
			ZnesekBlaga,
			PlacanoSIT,
			Sklic,
			Storno
		FROM [BIRO225].[dbo].[Racuni]
		WHERE Stevilka LIKE @number ESCAPE '\'
		ORDER BY Stevilka`,
		sql.Named("limit", limit),
		sql.Named("number", "%"+escapeLike(number)+"%"),
	)
	if err != nil {
		return nil, fmt.Errorf("search invoices: %w", err)
	}
	defer rows.Close()

	invoices := make([]*Invoice, 0)
	for rows.Next() {
		invoice := &Invoice{}
		var cancelled sql.NullInt16
		if err := rows.Scan(
			&invoice.ID,
			&invoice.InvoiceNumber,
			&invoice.IssueDate,
			&invoice.ServiceDate,
			&invoice.DueDate,
			&invoice.PaymentDate,
			&invoice.CustomerCode,
			&invoice.CustomerName,
			&invoice.CustomerAddress,
			&invoice.CustomerCity,
			&invoice.CustomerContact,
			&invoice.Currency,
			&invoice.Amount,
			&invoice.GoodsAmount,
			&invoice.PaidAmount,
			&invoice.PaymentReference,
			&cancelled,
		); err != nil {
			return nil, fmt.Errorf("scan invoice: %w", err)
		}
		if cancelled.Valid {
			value := cancelled.Int16 != 0
			invoice.Cancelled = &value
		}
		invoices = append(invoices, invoice)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read invoices: %w", err)
	}
	return invoices, nil
}

func escapeLike(value string) string {
	replacer := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`, `[`, `\[`)
	return replacer.Replace(value)
}
