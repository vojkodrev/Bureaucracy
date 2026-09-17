package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
)

type PriceQuoteRepository struct{ database *sql.DB }

func NewPriceQuoteRepository(database *sql.DB) *PriceQuoteRepository {
	return &PriceQuoteRepository{database: database}
}

func (repository *PriceQuoteRepository) GetTextTemplate(
	ctx context.Context,
	businessYear string,
) (*PriceQuoteTextTemplate, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	template := &PriceQuoteTextTemplate{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT
			(SELECT TOP 1 CAST(TextKlavzule AS nvarchar(max)) FROM [%s].[dbo].[Klavzule]
			 WHERE ISNULL(UvodPredracun, 0) <> 0 ORDER BY RecNo),
			(SELECT TOP 1 CASE WHEN ISNULL(Sklic, 0) <> 0
				THEN N'Pri plačilu se sklicujte na številko #ŠTEVILKA# !' + NCHAR(13) + NCHAR(10)
					+ COALESCE(CAST(TextKlavzule AS nvarchar(max)), N'')
				ELSE CAST(TextKlavzule AS nvarchar(max)) END
			 FROM [%s].[dbo].[Klavzule]
			 WHERE ISNULL(KonecPredracun, 0) <> 0 ORDER BY RecNo)`, databaseName, databaseName)).Scan(
		&template.IntroductoryText, &template.ClosingText,
	)
	if err != nil {
		return nil, fmt.Errorf("get price quote text template: %w", err)
	}
	return template, nil
}

func (repository *PriceQuoteRepository) GetByNumber(
	ctx context.Context,
	businessYear string,
	quoteNumber string,
) (*PriceQuote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	quoteNumber = strings.TrimSpace(quoteNumber)
	if quoteNumber == "" {
		return nil, fmt.Errorf("quoteNumber is required")
	}
	documentDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	masterDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	quote := &PriceQuote{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT p.RecNo, COALESCE(p.Stevilka, ''), p.DatumIzstavitve, p.DatumZapadlosti,
			p.SifraPartnerja, COALESCE(NULLIF(LTRIM(RTRIM(p.ImePartnerja)), ''), partner.Partner, ''),
			COALESCE(NULLIF(LTRIM(RTRIM(p.NaslovPartnerja)), ''), partner.Ulica, ''), partner.Posta,
			p.KrajPartnerja, partner.Drzava, partner.IDStevilka, p.KrajIzdaje, p.Valuta,
			p.Znesek, p.SpremniText, p.Klavzula
		FROM [%s].[dbo].[Predracuni] p
		LEFT JOIN [%s].[dbo].[Partner] partner ON partner.Sifra = p.SifraPartnerja
		WHERE p.Stevilka = @quoteNumber`, documentDatabase, masterDatabase),
		sql.Named("quoteNumber", quoteNumber)).Scan(
		&quote.ID, &quote.QuoteNumber, &quote.IssueDate, &quote.DueDate,
		&quote.CustomerCode, &quote.CustomerName, &quote.CustomerAddress,
		&quote.CustomerPostalCode, &quote.CustomerCity, &quote.CustomerCountry,
		&quote.CustomerTaxID, &quote.IssuePlace, &quote.Currency, &quote.Amount,
		&quote.IntroductoryText, &quote.ClosingText,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get price quote: %w", err)
	}
	quote.Items, err = repository.getItems(ctx, documentDatabase, masterDatabase, quoteNumber)
	if err != nil {
		return nil, err
	}
	return quote, nil
}

func (repository *PriceQuoteRepository) getItems(
	ctx context.Context,
	documentDatabase string,
	masterDatabase string,
	quoteNumber string,
) ([]*InvoiceItem, error) {
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT ps.RecNo, ps.Zaporedje, ps.Artikel, a.Opis, a.Enota, ps.SifraDavka,
			CAST(COALESCE(pd.Procent, a.Davek) AS float),
			ps.ZnesekBrezDavka / NULLIF(ps.Kolicina, 0),
			(ps.Znesek - ps.ZnesekBrezDavka) / NULLIF(ps.Kolicina, 0),
			ps.Kolicina, CAST(ps.Rabat AS float), ps.ZnesekBrezDavka, ps.Znesek
		FROM [%s].[dbo].[PredracuniSpecifikacija] ps
		LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = ps.Artikel
		LEFT JOIN [%s].[dbo].[PrometniDavek] pd ON pd.Sifra = ps.SifraDavka
		WHERE ps.Stevilka = @quoteNumber AND ISNULL(ps.Deleted, 0) = 0
		ORDER BY ps.Zaporedje, ps.RecNo`, documentDatabase, masterDatabase, masterDatabase),
		sql.Named("quoteNumber", quoteNumber))
	if err != nil {
		return nil, fmt.Errorf("get price quote items: %w", err)
	}
	defer rows.Close()
	items := make([]*InvoiceItem, 0)
	for rows.Next() {
		item := &InvoiceItem{}
		if err = rows.Scan(&item.ID, &item.Sequence, &item.ProductCode, &item.ProductName,
			&item.Unit, &item.TaxCode, &item.TaxRate, &item.UnitPrice, &item.UnitTaxAmount,
			&item.Quantity, &item.Discount, &item.NetAmount, &item.GrossAmount); err != nil {
			return nil, fmt.Errorf("scan price quote item: %w", err)
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("read price quote items: %w", err)
	}
	return items, nil
}

// Save atomically upserts a price quote and its complete item collection.
func (repository *PriceQuoteRepository) Save(
	ctx context.Context,
	businessYear string,
	input model.PriceQuoteInput,
) (*PriceQuote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.QuoteNumber = strings.TrimSpace(input.QuoteNumber)
	if input.QuoteNumber == "" {
		return nil, fmt.Errorf("quoteNumber is required")
	}
	for index, item := range input.Items {
		if item == nil || strings.TrimSpace(item.ProductCode) == "" {
			return nil, fmt.Errorf("productCode is required for price quote item %d", index+1)
		}
		if strings.TrimSpace(item.TaxCode) == "" {
			return nil, fmt.Errorf("taxCode is required for price quote item %d", index+1)
		}
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin saving price quote: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err = tx.ExecContext(ctx, "SET XACT_ABORT ON"); err != nil {
		return nil, fmt.Errorf("enable price quote transaction abort: %w", err)
	}
	oldNumber := input.QuoteNumber
	quoteID := 0
	if input.ID != nil && *input.ID > 0 {
		quoteID = *input.ID
		query := fmt.Sprintf(
			"SELECT COALESCE(Stevilka, '') FROM [%s].[dbo].[Predracuni] WHERE RecNo=@id",
			databaseName,
		)
		if err = tx.QueryRowContext(
			ctx,
			query,
			sql.Named("id", quoteID),
		).Scan(&oldNumber); err != nil {
			return nil, fmt.Errorf("find price quote for update: %w", err)
		}
		_, err = tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[Predracuni]
			SET Stevilka=@quoteNumber, DatumIzstavitve=@issueDate, DatumZapadlosti=@dueDate,
				SifraPartnerja=@customerCode, ImePartnerja=@customerName, NaslovPartnerja=@customerAddress,
				KrajPartnerja=@customerCity, SpremniText=@introductoryText, Klavzula=@closingText,
				Znesek=@amount
			WHERE RecNo=@id`, databaseName), priceQuoteArguments(input, quoteID)...)
	} else {
		err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[Predracuni]
			(Stevilka, DatumIzstavitve, DatumZapadlosti, SifraPartnerja, ImePartnerja,
			 NaslovPartnerja, KrajPartnerja, SpremniText, Klavzula, Znesek, Storno, VrstaPredracuna)
			OUTPUT INSERTED.RecNo VALUES
			(@quoteNumber, @issueDate, @dueDate, @customerCode, @customerName,
			 @customerAddress, @customerCity, @introductoryText, @closingText, @amount, 0, 0)`, databaseName),
			priceQuoteArguments(input, 0)...).Scan(&quoteID)
	}
	if err != nil {
		return nil, fmt.Errorf("save price quote: %w", err)
	}
	if _, err = tx.ExecContext(ctx, "CREATE TABLE #SavedPriceQuoteItems (RecNo int NOT NULL PRIMARY KEY)"); err != nil {
		return nil, fmt.Errorf("prepare price quote item synchronization: %w", err)
	}
	for index, item := range input.Items {
		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		itemID := 0
		args := priceQuoteItemArguments(input, item, sequence, oldNumber)
		if item.ID != nil && *item.ID > 0 {
			itemID = *item.ID
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[PredracuniSpecifikacija]
				SET Stevilka=@quoteNumber, Zaporedje=@sequence, Artikel=@productCode, Datum=@issueDate,
					Kolicina=@quantity, Rabat=@discount, ZnesekBrezDavka=@netAmount,
					Znesek=@grossAmount, Deleted=0, SifraDavka=@taxCode
				WHERE RecNo=@id AND Stevilka IN (@oldQuoteNumber, @quoteNumber)`,
				databaseName,
			), append(args, sql.Named("id", itemID))...)
			if updateErr != nil {
				return nil, fmt.Errorf("update price quote item %d: %w", index+1, updateErr)
			}
			affected, _ := result.RowsAffected()
			if affected != 1 {
				return nil, fmt.Errorf("price quote item RecNo %d was not found", itemID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[PredracuniSpecifikacija]
				(Stevilka, Zaporedje, Artikel, Datum, Kolicina, Rabat, ZnesekBrezDavka, Znesek, Deleted, SifraDavka)
				OUTPUT INSERTED.RecNo VALUES
				(@quoteNumber, @sequence, @productCode, @issueDate, @quantity, @discount,
				 @netAmount, @grossAmount, 0, @taxCode)`, databaseName), args...).Scan(&itemID)
			if err != nil {
				return nil, fmt.Errorf("insert price quote item %d: %w", index+1, err)
			}
		}
		if _, err = tx.ExecContext(
			ctx,
			"INSERT INTO #SavedPriceQuoteItems (RecNo) VALUES (@id)",
			sql.Named("id", itemID),
		); err != nil {
			return nil, fmt.Errorf("retain price quote item %d: %w", index+1, err)
		}
	}
	if _, err = tx.ExecContext(ctx, fmt.Sprintf(`DELETE item FROM [%s].[dbo].[PredracuniSpecifikacija] item
		WHERE item.Stevilka IN (@oldQuoteNumber, @quoteNumber)
		AND NOT EXISTS (SELECT 1 FROM #SavedPriceQuoteItems saved WHERE saved.RecNo=item.RecNo)`, databaseName),
		sql.Named("oldQuoteNumber", oldNumber), sql.Named("quoteNumber", input.QuoteNumber)); err != nil {
		return nil, fmt.Errorf("remove stale price quote items: %w", err)
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit price quote: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.QuoteNumber)
}

func priceQuoteArguments(input model.PriceQuoteInput, id int) []any {
	amount := 0.0
	for _, item := range input.Items {
		if item.GrossAmount != nil {
			amount += *item.GrossAmount
		}
	}
	return []any{sql.Named("id", id), sql.Named("quoteNumber", input.QuoteNumber),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)), sql.Named("dueDate", nullableInputTime(input.DueDate)),
		sql.Named("customerCode", input.CustomerCode), sql.Named("customerName", input.CustomerName),
		sql.Named("customerAddress", input.CustomerAddress), sql.Named("customerCity", input.CustomerCity),
		sql.Named("introductoryText", input.IntroductoryText), sql.Named("closingText", input.ClosingText),
		sql.Named("amount", amount)}
}

func priceQuoteItemArguments(
	input model.PriceQuoteInput,
	item *model.PriceQuoteItemInput,
	sequence int,
	oldNumber string,
) []any {
	return []any{sql.Named("oldQuoteNumber", oldNumber), sql.Named("quoteNumber", input.QuoteNumber),
		sql.Named("sequence", sequence), sql.Named("productCode", strings.TrimSpace(item.ProductCode)),
		sql.Named("taxCode", strings.TrimSpace(item.TaxCode)), sql.Named("issueDate", nullableInputTime(input.IssueDate)),
		sql.Named("quantity", item.Quantity), sql.Named("discount", item.Discount),
		sql.Named("netAmount", item.NetAmount), sql.Named("grossAmount", item.GrossAmount)}
}

func (repository *PriceQuoteRepository) Search(
	ctx context.Context, businessYear string, quoteNumber, customerID, customerName,
	productCode, productName *string, issuedFrom, issuedTo *time.Time,
	sortBy, sortDirection *string, page, pageSize int,
) (*PriceQuotePage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("pageSize must be between 1 and 10000")
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		return nil, fmt.Errorf("issuedFrom must not be after issuedTo")
	}
	orderBy, err := priceQuoteOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	arguments := []any{
		sql.Named("quoteNumber", optionalLikePattern(quoteNumber)),
		sql.Named("customerID", optionalLikePattern(customerID)),
		sql.Named("customerName", optionalLikePattern(customerName)),
		sql.Named("productCode", optionalLikePattern(productCode)),
		sql.Named("productName", optionalLikePattern(productName)),
		sql.Named("issuedFrom", nullableTime(issuedFrom)),
		sql.Named("issuedTo", nullableTime(issuedTo)),
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	productDatabaseName := fmt.Sprintf("BIRO%s3", businessYear)
	where := fmt.Sprintf(`
		WHERE (@quoteNumber = '' OR p.Stevilka LIKE @quoteNumber ESCAPE '\')
		  AND (@customerID = '' OR p.SifraPartnerja LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR p.ImePartnerja LIKE @customerName ESCAPE '\')
		  AND ((@productCode = '' AND @productName = '') OR EXISTS (
		      SELECT 1 FROM [%s].[dbo].[PredracuniSpecifikacija] ps
		      LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = ps.Artikel
		      WHERE ps.Stevilka = p.Stevilka AND ISNULL(ps.Deleted, 0) = 0
		        AND (@productCode = '' OR ps.Artikel LIKE @productCode ESCAPE '\')
		        AND (@productName = '' OR a.Opis LIKE @productName ESCAPE '\')
		  ))
		  AND (@issuedFrom IS NULL OR p.DatumIzstavitve >= @issuedFrom)
		  AND (@issuedTo IS NULL OR p.DatumIzstavitve < DATEADD(day, 1, @issuedTo))`, databaseName, productDatabaseName)

	var totalCount int
	countQuery := fmt.Sprintf(
		"SELECT COUNT(*) FROM [%s].[dbo].[Predracuni] p %s",
		databaseName,
		where,
	)
	if err = repository.database.QueryRowContext(
		ctx,
		countQuery,
		arguments...,
	).Scan(&totalCount); err != nil {
		return nil, fmt.Errorf("count price quotes: %w", err)
	}
	arguments = append(arguments, sql.Named("offset", (page-1)*pageSize), sql.Named("pageSize", pageSize))
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT p.RecNo, COALESCE(p.Stevilka, ''), p.DatumIzstavitve, p.DatumZapadlosti,
		       p.SifraPartnerja, p.ImePartnerja, p.Valuta, p.Znesek
		FROM [%s].[dbo].[Predracuni] p %s
		ORDER BY %s OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, where, orderBy), arguments...)
	if err != nil {
		return nil, fmt.Errorf("search price quotes: %w", err)
	}
	defer rows.Close()
	quotes := make([]*PriceQuote, 0)
	for rows.Next() {
		quote := &PriceQuote{}
		if err = rows.Scan(&quote.ID, &quote.QuoteNumber, &quote.IssueDate, &quote.DueDate,
			&quote.CustomerCode, &quote.CustomerName, &quote.Currency, &quote.Amount); err != nil {
			return nil, fmt.Errorf("scan price quote: %w", err)
		}
		quotes = append(quotes, quote)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("read price quotes: %w", err)
	}
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &PriceQuotePage{
		PriceQuotes: quotes,
		TotalCount:  totalCount,
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
	}, nil
}

func priceQuoteOrderBy(sortBy, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "p.Stevilka, p.RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}
	columns := map[string]string{
		"quoteNumber": "p.Stevilka",
		"customer":    "p.ImePartnerja",
		"amount":      "p.Znesek",
		"issueDate":   "p.DatumIzstavitve",
		"dueDate":     "p.DatumZapadlosti",
	}
	column, ok := columns[strings.TrimSpace(*sortBy)]
	if !ok {
		return "", fmt.Errorf("unsupported price quote sort column")
	}
	direction := strings.ToUpper(strings.TrimSpace(*sortDirection))
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return fmt.Sprintf("%s %s, p.RecNo %s", column, direction, direction), nil
}
