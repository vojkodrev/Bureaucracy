package main

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
)

type InvoiceRepository struct {
	database *sql.DB
}

var businessYearPattern = regexp.MustCompile(`^[0-9]+$`)

func NewInvoiceRepository(database *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{database: database}
}

func (repository *InvoiceRepository) GetTextTemplate(ctx context.Context, businessYear string) (*InvoiceTextTemplate, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	template := &InvoiceTextTemplate{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT
			(SELECT TOP 1 CAST(TextKlavzule AS nvarchar(max))
			 FROM [%s].[dbo].[Klavzule]
			 WHERE ISNULL(UvodRacun, 0) <> 0
			 ORDER BY RecNo),
			(SELECT TOP 1
				CASE WHEN ISNULL(Sklic, 0) <> 0
					THEN N'Pri plačilu se sklicujte na številko #ŠTEVILKA# !'
						+ NCHAR(13) + NCHAR(10) + COALESCE(CAST(TextKlavzule AS nvarchar(max)), N'')
					ELSE CAST(TextKlavzule AS nvarchar(max))
				END
			 FROM [%s].[dbo].[Klavzule]
			 WHERE ISNULL(KonecRacun, 0) <> 0
			 ORDER BY RecNo)`, databaseName, databaseName)).Scan(
		&template.IntroductoryText,
		&template.ClosingText,
	)
	if err != nil {
		return nil, fmt.Errorf("get invoice text template: %w", err)
	}
	return template, nil
}

// Save atomically upserts an invoice and its complete item collection.
func (repository *InvoiceRepository) Save(ctx context.Context, businessYear string, input model.InvoiceInput) (*Invoice, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.InvoiceNumber = strings.TrimSpace(input.InvoiceNumber)
	if input.InvoiceNumber == "" {
		return nil, fmt.Errorf("invoiceNumber is required")
	}
	for index, item := range input.Items {
		if item == nil {
			return nil, fmt.Errorf("invoice item %d is required", index+1)
		}
		item.ProductCode = strings.TrimSpace(item.ProductCode)
		if item.ProductCode == "" {
			return nil, fmt.Errorf("productCode is required for invoice item %d", index+1)
		}
		item.TaxCode = strings.TrimSpace(item.TaxCode)
		if item.TaxCode == "" {
			return nil, fmt.Errorf("taxCode is required for invoice item %d", index+1)
		}
	}

	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin saving invoice: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err = tx.ExecContext(ctx, "SET XACT_ABORT ON"); err != nil {
		return nil, fmt.Errorf("enable invoice transaction abort: %w", err)
	}

	oldInvoiceNumber := input.InvoiceNumber
	invoiceID := 0
	if input.ID != nil && *input.ID > 0 {
		invoiceID = *input.ID
		if err = tx.QueryRowContext(ctx, fmt.Sprintf("SELECT COALESCE(Stevilka, '') FROM [%s].[dbo].[Racuni] WHERE RecNo = @id", databaseName), sql.Named("id", invoiceID)).Scan(&oldInvoiceNumber); err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("invoice RecNo %d was not found", invoiceID)
			}
			return nil, fmt.Errorf("find invoice for update: %w", err)
		}
		result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`
			UPDATE [%s].[dbo].[Racuni]
			SET Stevilka=@invoiceNumber, DatumIzstavitve=@issueDate, DatumDUR=@serviceDate,
				DatumZapadlosti=@dueDate, DatumPlacila=@paymentDate,
				SifraPartnerja=@customerCode, ImePartnerja=@customerName,
				NaslovPartnerja=@customerAddress, KrajPartnerja=@customerCity, PlacanoSIT=@paidAmount,
				SpremniText=@introductoryText, Klavzula=@closingText, Znesek=@amount, ZnesekBlaga=@goodsAmount
			WHERE RecNo=@id`, databaseName), invoiceArguments(input, invoiceID)...)
		if updateErr != nil {
			return nil, fmt.Errorf("update invoice: %w", updateErr)
		}
		affected, affectedErr := result.RowsAffected()
		if affectedErr != nil || affected != 1 {
			return nil, fmt.Errorf("update invoice RecNo %d affected %d rows", invoiceID, affected)
		}
	} else {
		err = tx.QueryRowContext(ctx, fmt.Sprintf(`
			INSERT INTO [%s].[dbo].[Racuni] (
				Stevilka, DatumIzstavitve, DatumDUR, DatumZapadlosti, DatumPlacila, SifraPartnerja,
				ImePartnerja, NaslovPartnerja, KrajPartnerja, PlacanoSIT,
				SpremniText, Klavzula, Znesek, ZnesekBlaga, Storno
			) OUTPUT INSERTED.RecNo VALUES (
				@invoiceNumber, @issueDate, @serviceDate, @dueDate, @paymentDate, @customerCode,
				@customerName, @customerAddress, @customerCity, @paidAmount,
				@introductoryText, @closingText, @amount, @goodsAmount, 0
			)`, databaseName), invoiceArguments(input, 0)...).Scan(&invoiceID)
		if err != nil {
			return nil, fmt.Errorf("insert invoice: %w", err)
		}
	}

	if _, err = tx.ExecContext(ctx, "CREATE TABLE #SavedInvoiceItems (RecNo int NOT NULL PRIMARY KEY)"); err != nil {
		return nil, fmt.Errorf("prepare invoice item synchronization: %w", err)
	}
	for index, item := range input.Items {
		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		itemID := 0
		if item.ID != nil && *item.ID > 0 {
			itemID = *item.ID
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`
				UPDATE [%s].[dbo].[RacuniSpecifikacija]
				SET Stevilka=@invoiceNumber, Zaporedje=@sequence, Artikel=@productCode,
					Datum=@issueDate, Kolicina=@quantity, Rabat=@discount,
					ZnesekBrezDavka=@netAmount, Znesek=@grossAmount, Deleted=0,
					SifraDavka=@taxCode
				WHERE RecNo=@id AND Stevilka IN (@oldInvoiceNumber, @invoiceNumber)`, databaseName), invoiceItemArguments(input, item, itemID, sequence, oldInvoiceNumber)...)
			if updateErr != nil {
				return nil, fmt.Errorf("update invoice item %d: %w", index+1, updateErr)
			}
			affected, affectedErr := result.RowsAffected()
			if affectedErr != nil || affected != 1 {
				return nil, fmt.Errorf("invoice item RecNo %d was not found", itemID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`
				INSERT INTO [%s].[dbo].[RacuniSpecifikacija] (
					Stevilka, Zaporedje, Artikel, Datum, Kolicina, Rabat,
					ZnesekBrezDavka, Znesek, Deleted, SifraDavka
				) OUTPUT INSERTED.RecNo VALUES (
					@invoiceNumber, @sequence, @productCode, @issueDate, @quantity, @discount,
					@netAmount, @grossAmount, 0, @taxCode
				)`, databaseName), invoiceItemArguments(input, item, 0, sequence, oldInvoiceNumber)...).Scan(&itemID)
			if err != nil {
				return nil, fmt.Errorf("insert invoice item %d: %w", index+1, err)
			}
		}
		if _, err = tx.ExecContext(ctx, "INSERT INTO #SavedInvoiceItems (RecNo) VALUES (@id)", sql.Named("id", itemID)); err != nil {
			return nil, fmt.Errorf("retain invoice item %d: %w", index+1, err)
		}
	}
	if _, err = tx.ExecContext(ctx, fmt.Sprintf(`
		DELETE item FROM [%s].[dbo].[RacuniSpecifikacija] item
		WHERE item.Stevilka IN (@oldInvoiceNumber, @invoiceNumber)
		  AND NOT EXISTS (SELECT 1 FROM #SavedInvoiceItems saved WHERE saved.RecNo=item.RecNo)`, databaseName),
		sql.Named("oldInvoiceNumber", oldInvoiceNumber), sql.Named("invoiceNumber", input.InvoiceNumber)); err != nil {
		return nil, fmt.Errorf("remove stale invoice items: %w", err)
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit invoice: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.InvoiceNumber)
}

func invoiceArguments(input model.InvoiceInput, id int) []any {
	goodsAmount, amount := 0.0, 0.0
	for _, item := range input.Items {
		if item.NetAmount != nil {
			goodsAmount += *item.NetAmount
		}
		if item.GrossAmount != nil {
			amount += *item.GrossAmount
		}
	}
	return []any{
		sql.Named("id", id), sql.Named("invoiceNumber", input.InvoiceNumber),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)), sql.Named("serviceDate", nullableInputTime(input.ServiceDate)),
		sql.Named("dueDate", nullableInputTime(input.DueDate)), sql.Named("paymentDate", nullableInputTime(input.PaymentDate)),
		sql.Named("customerCode", input.CustomerCode),
		sql.Named("customerName", input.CustomerName), sql.Named("customerAddress", input.CustomerAddress),
		sql.Named("customerCity", input.CustomerCity), sql.Named("paidAmount", input.PaidAmount),
		sql.Named("introductoryText", input.IntroductoryText), sql.Named("closingText", input.ClosingText),
		sql.Named("amount", amount), sql.Named("goodsAmount", goodsAmount),
	}
}

func invoiceItemArguments(input model.InvoiceInput, item *model.InvoiceItemInput, id, sequence int, oldInvoiceNumber string) []any {
	return []any{
		sql.Named("id", id), sql.Named("oldInvoiceNumber", oldInvoiceNumber), sql.Named("invoiceNumber", input.InvoiceNumber),
		sql.Named("sequence", sequence), sql.Named("productCode", item.ProductCode),
		sql.Named("taxCode", item.TaxCode),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)), sql.Named("quantity", item.Quantity),
		sql.Named("discount", item.Discount), sql.Named("netAmount", item.NetAmount), sql.Named("grossAmount", item.GrossAmount),
	}
}

func nullableInputTime(value *time.Time) any {
	if value == nil {
		return nil
	}
	return *value
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
			COALESCE(NULLIF(LTRIM(RTRIM(r.ImePartnerja)), ''), p.Partner, ''),
			COALESCE(NULLIF(LTRIM(RTRIM(r.NaslovPartnerja)), ''), p.Ulica, ''),
			p.Posta,
			r.KrajPartnerja,
			p.Drzava,
			p.IDStevilka,
			r.KrajIzdaje,
			r.KontaktPartnerja,
			r.Valuta,
			r.Znesek,
			r.ZnesekBlaga,
			r.PlacanoSIT,
			r.Sklic,
			r.SpremniText,
			r.Klavzula,
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
		&invoice.CustomerTaxID,
		&invoice.IssuePlace,
		&invoice.CustomerContact,
		&invoice.Currency,
		&invoice.Amount,
		&invoice.GoodsAmount,
		&invoice.PaidAmount,
		&invoice.PaymentReference,
		&invoice.IntroductoryText,
		&invoice.ClosingText,
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
			a.Enota,
			rs.SifraDavka,
			CAST(COALESCE(pd.Procent, a.Davek) AS float),
			rs.ZnesekBrezDavka / NULLIF(rs.Kolicina, 0),
			(rs.Znesek - rs.ZnesekBrezDavka) / NULLIF(rs.Kolicina, 0),
			rs.Kolicina,
			CAST(rs.Rabat AS float),
			rs.ZnesekBrezDavka,
			rs.Znesek
		FROM [%s].[dbo].[RacuniSpecifikacija] rs
		LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = rs.Artikel
		LEFT JOIN [%s].[dbo].[PrometniDavek] pd ON pd.Sifra = rs.SifraDavka
		WHERE rs.Stevilka = @invoiceNumber
		  AND ISNULL(rs.Deleted, 0) = 0
		ORDER BY rs.Zaporedje, rs.RecNo`, invoiceDatabaseName, productDatabaseName, productDatabaseName),
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
			&item.Unit,
			&item.TaxCode,
			&item.TaxRate,
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
	sortBy *string,
	sortDirection *string,
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
	orderBy, err := invoiceOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
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
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
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
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, orderBy),
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

func invoiceOrderBy(sortBy *string, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "Stevilka, RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}

	columns := map[string]string{
		"invoiceNumber": "Stevilka",
		"customer":      "ImePartnerja",
		"amount":        "Znesek",
		"issueDate":     "DatumIzstavitve",
		"dueDate":       "DatumZapadlosti",
		"paymentDate":   "DatumPlacila",
	}
	column, ok := columns[*sortBy]
	if !ok {
		return "", fmt.Errorf("invalid invoice sort column %q", *sortBy)
	}
	direction := strings.ToUpper(*sortDirection)
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return column + " " + direction + ", RecNo " + direction, nil
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
