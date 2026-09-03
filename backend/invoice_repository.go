package main

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"
)

type InvoiceRepository struct {
	database *sql.DB
}

var businessYearPattern = regexp.MustCompile(`^[0-9]+$`)

func NewInvoiceRepository(database *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{database: database}
}

func (repository *InvoiceRepository) GetByNumber(
	ctx context.Context,
	businessYear string,
	invoiceNumber string,
) (*Invoice, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	invoiceNumber = strings.TrimSpace(invoiceNumber)
	if invoiceNumber == "" {
		return nil, fmt.Errorf("invoiceNumber is required")
	}

	invoiceDatabaseName := fmt.Sprintf("BIRO%s5", businessYear)
	customerDatabaseName := fmt.Sprintf("BIRO%s3", businessYear)
	row := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT
			r.RecNo,
			COALESCE(r.Stevilka, ''),
			r.DatumIzstavitve,
			r.DatumDUR,
			r.DatumZapadlosti,
			r.DatumPlacila,
			r.SifraPartnerja,
			r.ImePartnerja,
			r.NaslovPartnerja,
			p.Posta,
			r.KrajPartnerja,
			p.Drzava,
			r.KontaktPartnerja,
			r.Valuta,
			r.Znesek,
			r.ZnesekBlaga,
			r.PlacanoSIT,
			r.Sklic,
			r.Storno
		FROM [%s].[dbo].[Racuni] r
		LEFT JOIN [%s].[dbo].[Partner] p ON p.Sifra = r.SifraPartnerja
		WHERE r.Stevilka = @invoiceNumber`, invoiceDatabaseName, customerDatabaseName),
		sql.Named("invoiceNumber", invoiceNumber),
	)

	invoice := &Invoice{}
	var cancelled sql.NullInt16
	if err := row.Scan(
		&invoice.ID,
		&invoice.InvoiceNumber,
		&invoice.IssueDate,
		&invoice.ServiceDate,
		&invoice.DueDate,
		&invoice.PaymentDate,
		&invoice.CustomerCode,
		&invoice.CustomerName,
		&invoice.CustomerAddress,
		&invoice.CustomerPostalCode,
		&invoice.CustomerCity,
		&invoice.CustomerCountry,
		&invoice.CustomerContact,
		&invoice.Currency,
		&invoice.Amount,
		&invoice.GoodsAmount,
		&invoice.PaidAmount,
		&invoice.PaymentReference,
		&cancelled,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("get invoice: %w", err)
	}
	if cancelled.Valid {
		value := cancelled.Int16 != 0
		invoice.Cancelled = &value
	}

	items, err := repository.getItems(ctx, invoiceDatabaseName, customerDatabaseName, invoiceNumber)
	if err != nil {
		return nil, err
	}
	invoice.Items = items
	return invoice, nil
}

func (repository *InvoiceRepository) getItems(
	ctx context.Context,
	invoiceDatabaseName string,
	productDatabaseName string,
	invoiceNumber string,
) ([]*InvoiceItem, error) {
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT
			rs.RecNo,
			rs.Zaporedje,
			rs.Artikel,
			a.Opis,
			rs.ZnesekBrezDavka / NULLIF(rs.Kolicina, 0),
			(rs.Znesek - rs.ZnesekBrezDavka) / NULLIF(rs.Kolicina, 0),
			rs.Kolicina,
			CAST(rs.Rabat AS float),
			rs.ZnesekBrezDavka,
			rs.Znesek
		FROM [%s].[dbo].[RacuniSpecifikacija] rs
		LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = rs.Artikel
		WHERE rs.Stevilka = @invoiceNumber
		  AND ISNULL(rs.Deleted, 0) = 0
		ORDER BY rs.Zaporedje, rs.RecNo`, invoiceDatabaseName, productDatabaseName),
		sql.Named("invoiceNumber", invoiceNumber),
	)
	if err != nil {
		return nil, fmt.Errorf("get invoice items: %w", err)
	}
	defer rows.Close()

	items := make([]*InvoiceItem, 0)
	for rows.Next() {
		item := &InvoiceItem{}
		if err := rows.Scan(
			&item.ID,
			&item.Sequence,
			&item.ProductCode,
			&item.ProductName,
			&item.UnitPrice,
			&item.UnitTaxAmount,
			&item.Quantity,
			&item.Discount,
			&item.NetAmount,
			&item.GrossAmount,
		); err != nil {
			return nil, fmt.Errorf("scan invoice item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read invoice items: %w", err)
	}
	return items, nil
}

func (repository *InvoiceRepository) Search(
	ctx context.Context,
	businessYear string,
	invoiceNumber *string,
	customerID *string,
	customerName *string,
	issuedFrom *time.Time,
	issuedTo *time.Time,
	page int,
	pageSize int,
) (*InvoicePage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 100 {
		return nil, fmt.Errorf("pageSize must be between 1 and 100")
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		return nil, fmt.Errorf("issuedFrom must not be after issuedTo")
	}

	invoiceNumberPattern := optionalLikePattern(invoiceNumber)
	customerIDPattern := optionalLikePattern(customerID)
	customerNamePattern := optionalLikePattern(customerName)
	queryArguments := []any{
		sql.Named("invoiceNumber", invoiceNumberPattern),
		sql.Named("customerID", customerIDPattern),
		sql.Named("customerName", customerNamePattern),
		sql.Named("issuedFrom", nullableTime(issuedFrom)),
		sql.Named("issuedTo", nullableTime(issuedTo)),
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)

	var totalCount int
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[Racuni]
		WHERE (@invoiceNumber = '' OR Stevilka LIKE @invoiceNumber ESCAPE '\')
		  AND (@customerID = '' OR SifraPartnerja LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR ImePartnerja LIKE @customerName ESCAPE '\')
		  AND (@issuedFrom IS NULL OR DatumIzstavitve >= @issuedFrom)
		  AND (@issuedTo IS NULL OR DatumIzstavitve < DATEADD(day, 1, @issuedTo))`, databaseName),
		queryArguments...,
	).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count invoices: %w", err)
	}

	queryArguments = append(queryArguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT
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
		FROM [%s].[dbo].[Racuni]
		WHERE (@invoiceNumber = '' OR Stevilka LIKE @invoiceNumber ESCAPE '\')
		  AND (@customerID = '' OR SifraPartnerja LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR ImePartnerja LIKE @customerName ESCAPE '\')
		  AND (@issuedFrom IS NULL OR DatumIzstavitve >= @issuedFrom)
		  AND (@issuedTo IS NULL OR DatumIzstavitve < DATEADD(day, 1, @issuedTo))
		ORDER BY Stevilka
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName),
		queryArguments...,
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
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &InvoicePage{
		Invoices:   invoices,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func nullableTime(value *time.Time) sql.NullTime {
	if value == nil {
		return sql.NullTime{}
	}

	return sql.NullTime{Time: *value, Valid: true}
}

func optionalLikePattern(value *string) string {
	if value == nil || strings.TrimSpace(*value) == "" {
		return ""
	}

	return "%" + escapeLike(strings.TrimSpace(*value)) + "%"
}

func escapeLike(value string) string {
	replacer := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`, `[`, `\[`)
	return replacer.Replace(value)
}
