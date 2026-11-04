package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
	"bureaucracy/backend/lib"
)

type DeliveryNoteRepository struct{ database *sql.DB }

func NewDeliveryNoteRepository(database *sql.DB) *DeliveryNoteRepository {
	return &DeliveryNoteRepository{database: database}
}

func (repository *DeliveryNoteRepository) GetByNumber(
	ctx context.Context,
	businessYear string,
	number string,
) (*DeliveryNote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	number = strings.TrimSpace(number)
	if number == "" {
		return nil, fmt.Errorf("deliveryNoteNumber is required")
	}
	documentDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	masterDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	note := &DeliveryNote{}
	var withoutAmounts sql.NullInt16
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT d.RecNo, COALESCE(d.Stevilka, ''), d.DatumIzstavitve, d.RokDobave,
			d.SifraPartnerja, COALESCE(NULLIF(LTRIM(RTRIM(d.ImePartnerja)), ''), partner.Partner, ''),
			COALESCE(NULLIF(LTRIM(RTRIM(d.NaslovPartnerja)), ''), partner.Ulica, ''), partner.Posta,
			d.KrajPartnerja, partner.Drzava, partner.IDStevilka, d.KrajIzdaje, d.Valuta,
			d.Znesek, d.SpremniText, d.Klavzula, d.BrezZneskov
		FROM [%s].[dbo].[DobavniceIzdaja] d
		LEFT JOIN [%s].[dbo].[Partner] partner ON partner.Sifra = d.SifraPartnerja
		WHERE d.Stevilka = @number`, documentDatabase, masterDatabase), sql.Named("number", number)).Scan(
		&note.ID, &note.DeliveryNoteNumber, &note.IssueDate, &note.DeliveryDate,
		&note.CustomerCode, &note.CustomerName, &note.CustomerAddress, &note.CustomerPostalCode,
		&note.CustomerCity, &note.CustomerCountry, &note.CustomerTaxID, &note.IssuePlace,
		&note.Currency, &note.Amount, &note.IntroductoryText, &note.ClosingText, &withoutAmounts,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get delivery note: %w", err)
	}
	note.WithoutAmounts = withoutAmounts.Valid && withoutAmounts.Int16 != 0
	note.Items, err = repository.getItems(ctx, documentDatabase, masterDatabase, number)
	if err != nil {
		return nil, err
	}
	return note, nil
}

func (repository *DeliveryNoteRepository) getItems(
	ctx context.Context,
	documentDatabase string,
	masterDatabase string,
	number string,
) ([]*InvoiceItem, error) {
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT ds.RecNo, ds.Zaporedje, ds.Artikel, a.Opis, a.Enota, ds.SifraDavka,
			CAST(COALESCE(pd.Procent, a.Davek) AS float),
			ds.ZnesekBrezDavka / NULLIF(ds.Kolicina, 0),
			(ds.ZnesekBrezDavka / NULLIF(ds.Kolicina, 0)) * (CAST(COALESCE(pd.Procent, a.Davek) AS float) / 100),
			ds.Kolicina, CAST(ds.Rabat AS float),
			ds.ZnesekBrezDavka * (1 - COALESCE(CAST(ds.Rabat AS float), 0) / 100), ds.Znesek
		FROM [%s].[dbo].[DobavniceIzdajaSpecifikacija] ds
		LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = ds.Artikel
		LEFT JOIN [%s].[dbo].[PrometniDavek] pd ON pd.Sifra = ds.SifraDavka
		WHERE ds.Stevilka = @number AND ISNULL(ds.Deleted, 0) = 0
		ORDER BY ds.Zaporedje, ds.RecNo`, documentDatabase, masterDatabase, masterDatabase), sql.Named("number", number))
	if err != nil {
		return nil, fmt.Errorf("get delivery note items: %w", err)
	}
	defer rows.Close()
	items := make([]*InvoiceItem, 0)
	for rows.Next() {
		item := &InvoiceItem{}
		if err = rows.Scan(&item.ID, &item.Sequence, &item.ProductCode, &item.ProductName, &item.Unit,
			&item.TaxCode, &item.TaxRate, &item.UnitPrice, &item.UnitTaxAmount, &item.Quantity,
			&item.Discount, &item.NetAmount, &item.GrossAmount); err != nil {
			return nil, fmt.Errorf("scan delivery note item: %w", err)
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("read delivery note items: %w", err)
	}
	return items, nil
}

func (repository *DeliveryNoteRepository) Save(
	ctx context.Context,
	businessYear string,
	input model.DeliveryNoteInput,
) (*DeliveryNote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.DeliveryNoteNumber = strings.TrimSpace(input.DeliveryNoteNumber)
	if input.DeliveryNoteNumber == "" {
		return nil, fmt.Errorf("deliveryNoteNumber is required")
	}
	for index, item := range input.Items {
		if item == nil || strings.TrimSpace(item.ProductCode) == "" {
			return nil, fmt.Errorf("productCode is required for delivery note item %d", index+1)
		}
		if strings.TrimSpace(item.TaxCode) == "" {
			return nil, fmt.Errorf("taxCode is required for delivery note item %d", index+1)
		}
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin saving delivery note: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err = tx.ExecContext(ctx, "SET XACT_ABORT ON"); err != nil {
		return nil, fmt.Errorf("enable delivery note transaction abort: %w", err)
	}
	oldNumber := input.DeliveryNoteNumber
	noteID := 0
	args := deliveryNoteArguments(input, noteID)
	if input.ID != nil && *input.ID > 0 {
		noteID = *input.ID
		query := fmt.Sprintf(
			`SELECT COALESCE(Stevilka, '')
			 FROM [%s].[dbo].[DobavniceIzdaja]
			 WHERE RecNo=@id`,
			databaseName,
		)
		if err = tx.QueryRowContext(
			ctx,
			query,
			sql.Named("id", noteID),
		).Scan(&oldNumber); err != nil {
			return nil, fmt.Errorf("find delivery note for update: %w", err)
		}
		args = deliveryNoteArguments(input, noteID)
		_, err = tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[DobavniceIzdaja]
			SET Stevilka=@number, DatumIzstavitve=@issueDate, RokDobave=@deliveryDate,
				SifraPartnerja=@customerCode, ImePartnerja=@customerName, NaslovPartnerja=@customerAddress,
				KrajPartnerja=@customerCity, SpremniText=@introductoryText, Klavzula=@closingText,
				Znesek=@amount, BrezZneskov=@withoutAmounts
			WHERE RecNo=@id`, databaseName), args...)
	} else {
		err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[DobavniceIzdaja]
			(Stevilka, DatumIzstavitve, RokDobave, SifraPartnerja, ImePartnerja, NaslovPartnerja,
			 KrajPartnerja, SpremniText, Klavzula, Znesek, BrezZneskov, Storno, Dobavnica, VrstaDobavnice)
			OUTPUT INSERTED.RecNo VALUES
			(@number, @issueDate, @deliveryDate, @customerCode, @customerName, @customerAddress,
			 @customerCity, @introductoryText, @closingText, @amount,
			 @withoutAmounts, 0, 1, 0)`, databaseName),
			args...,
		).Scan(&noteID)
	}
	if err != nil {
		return nil, fmt.Errorf("save delivery note: %w", err)
	}
	if _, err = tx.ExecContext(ctx, "CREATE TABLE #SavedDeliveryNoteItems (RecNo int NOT NULL PRIMARY KEY)"); err != nil {
		return nil, fmt.Errorf("prepare delivery note item synchronization: %w", err)
	}
	for index, item := range input.Items {
		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		itemID := 0
		itemArgs := deliveryNoteItemArguments(input, item, sequence, oldNumber)
		if item.ID != nil && *item.ID > 0 {
			itemID = *item.ID
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[DobavniceIzdajaSpecifikacija]
				SET Stevilka=@number, Zaporedje=@sequence, Artikel=@productCode, Datum=@issueDate,
					Kolicina=@quantity, Rabat=@discount, ZnesekBrezDavka=@netAmount,
					Znesek=@grossAmount, Deleted=0, SifraDavka=@taxCode
				WHERE RecNo=@id AND Stevilka IN (@oldNumber, @number)`, databaseName), append(itemArgs, sql.Named("id", itemID))...)
			if updateErr != nil {
				return nil, fmt.Errorf("update delivery note item %d: %w", index+1, updateErr)
			}
			affected, _ := result.RowsAffected()
			if affected != 1 {
				return nil, fmt.Errorf("delivery note item RecNo %d was not found", itemID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[DobavniceIzdajaSpecifikacija]
				(Stevilka, Zaporedje, Artikel, Datum, Kolicina, Rabat, ZnesekBrezDavka, Znesek, Deleted, SifraDavka)
				OUTPUT INSERTED.RecNo VALUES
				(@number, @sequence, @productCode, @issueDate, @quantity,
				 @discount, @netAmount, @grossAmount, 0, @taxCode)`,
				databaseName,
			), itemArgs...).Scan(&itemID)
			if err != nil {
				return nil, fmt.Errorf("insert delivery note item %d: %w", index+1, err)
			}
		}
		if _, err = tx.ExecContext(
			ctx,
			"INSERT INTO #SavedDeliveryNoteItems (RecNo) VALUES (@id)",
			sql.Named("id", itemID),
		); err != nil {
			return nil, fmt.Errorf("retain delivery note item %d: %w", index+1, err)
		}
	}
	if _, err = tx.ExecContext(ctx, fmt.Sprintf(`DELETE item FROM [%s].[dbo].[DobavniceIzdajaSpecifikacija] item
		WHERE item.Stevilka IN (@oldNumber, @number)
		AND NOT EXISTS (SELECT 1 FROM #SavedDeliveryNoteItems saved WHERE saved.RecNo=item.RecNo)`, databaseName),
		sql.Named("oldNumber", oldNumber), sql.Named("number", input.DeliveryNoteNumber)); err != nil {
		return nil, fmt.Errorf("remove stale delivery note items: %w", err)
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit delivery note: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.DeliveryNoteNumber)
}

func deliveryNoteArguments(input model.DeliveryNoteInput, id int) []any {
	amount := 0.0
	for _, item := range input.Items {
		if item.GrossAmount != nil {
			amount += lib.RoundCurrency(*item.GrossAmount)
		}
	}
	return []any{sql.Named("id", id), sql.Named("number", input.DeliveryNoteNumber),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)),
		sql.Named("deliveryDate", nullableInputTime(input.DeliveryDate)),
		sql.Named("customerCode", input.CustomerCode), sql.Named("customerName", input.CustomerName),
		sql.Named("customerAddress", input.CustomerAddress), sql.Named("customerCity", input.CustomerCity),
		sql.Named("introductoryText", input.IntroductoryText), sql.Named("closingText", input.ClosingText),
		sql.Named("amount", lib.RoundCurrency(amount)), sql.Named("withoutAmounts", input.WithoutAmounts)}
}

func deliveryNoteItemArguments(
	input model.DeliveryNoteInput,
	item *model.DeliveryNoteItemInput,
	sequence int,
	oldNumber string,
) []any {
	return []any{sql.Named("oldNumber", oldNumber), sql.Named("number", input.DeliveryNoteNumber),
		sql.Named("sequence", sequence), sql.Named("productCode", strings.TrimSpace(item.ProductCode)),
		sql.Named("taxCode", strings.TrimSpace(item.TaxCode)), sql.Named("issueDate", nullableInputTime(input.IssueDate)),
		sql.Named("quantity", item.Quantity), sql.Named("discount", item.Discount),
		sql.Named("netAmount", item.NetAmount), sql.Named("grossAmount", item.GrossAmount)}
}

func (repository *DeliveryNoteRepository) Search(
	ctx context.Context,
	businessYear string,
	number *string,
	customerID *string,
	customerName *string,
	productCode *string,
	productName *string,
	issuedFrom *time.Time,
	issuedTo *time.Time,
	sortBy *string,
	sortDirection *string,
	page int,
	pageSize int,
) (*DeliveryNotePage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 || pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("invalid delivery note page or page size")
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		return nil, fmt.Errorf("issuedFrom must not be after issuedTo")
	}
	orderBy, err := deliveryNoteOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}
	args := []any{
		sql.Named("number", lib.OptionalLikePattern(number)),
		sql.Named("customerID", lib.OptionalLikePattern(customerID)),
		sql.Named("customerName", lib.OptionalLikePattern(customerName)),
		sql.Named("productCode", lib.OptionalLikePattern(productCode)),
		sql.Named("productName", lib.WordsLikePattern(productName)),
		sql.Named("issuedFrom", nullableTime(issuedFrom)),
		sql.Named("issuedTo", nullableTime(issuedTo)),
	}
	documentDatabase := fmt.Sprintf("BIRO%s5", businessYear)
	masterDatabase := fmt.Sprintf("BIRO%s3", businessYear)
	where := fmt.Sprintf(`WHERE (@number='' OR d.Stevilka LIKE @number ESCAPE '\')
		AND (@customerID='' OR d.SifraPartnerja LIKE @customerID ESCAPE '\')
		AND (@customerName='' OR d.ImePartnerja LIKE @customerName ESCAPE '\')
		AND ((@productCode='' AND @productName='') OR EXISTS (
			SELECT 1 FROM [%s].[dbo].[DobavniceIzdajaSpecifikacija] ds
			LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel=ds.Artikel
			WHERE ds.Stevilka=d.Stevilka AND ISNULL(ds.Deleted,0)=0
			AND (@productCode='' OR ds.Artikel LIKE @productCode ESCAPE '\')
			AND (@productName='' OR a.Opis LIKE @productName ESCAPE '\')))
		AND (@issuedFrom IS NULL OR d.DatumIzstavitve>=@issuedFrom)
		AND (@issuedTo IS NULL OR d.DatumIzstavitve<DATEADD(day,1,@issuedTo))`, documentDatabase, masterDatabase)
	var totalCount int
	countQuery := fmt.Sprintf(
		"SELECT COUNT(*) FROM [%s].[dbo].[DobavniceIzdaja] d %s",
		documentDatabase,
		where,
	)
	if err = repository.database.QueryRowContext(
		ctx,
		countQuery,
		args...,
	).Scan(&totalCount); err != nil {
		return nil, fmt.Errorf("count delivery notes: %w", err)
	}
	args = append(args, sql.Named("offset", (page-1)*pageSize), sql.Named("pageSize", pageSize))
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT d.RecNo, COALESCE(d.Stevilka,''),
			d.DatumIzstavitve, d.RokDobave,
		d.SifraPartnerja, d.ImePartnerja, d.Valuta, d.Znesek, ISNULL(d.BrezZneskov,0)
		FROM [%s].[dbo].[DobavniceIzdaja] d %s ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, documentDatabase, where, orderBy), args...)
	if err != nil {
		return nil, fmt.Errorf("search delivery notes: %w", err)
	}
	defer rows.Close()
	notes := make([]*DeliveryNote, 0)
	for rows.Next() {
		note := &DeliveryNote{}
		var withoutAmounts int
		if err = rows.Scan(
			&note.ID,
			&note.DeliveryNoteNumber,
			&note.IssueDate,
			&note.DeliveryDate,
			&note.CustomerCode,
			&note.CustomerName,
			&note.Currency,
			&note.Amount,
			&withoutAmounts,
		); err != nil {
			return nil, fmt.Errorf("scan delivery note: %w", err)
		}
		note.WithoutAmounts = withoutAmounts != 0
		notes = append(notes, note)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("read delivery notes: %w", err)
	}
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &DeliveryNotePage{
		DeliveryNotes: notes,
		TotalCount:    totalCount,
		Page:          page,
		PageSize:      pageSize,
		TotalPages:    totalPages,
	}, nil
}

func deliveryNoteOrderBy(sortBy, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "d.Stevilka, d.RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}
	columns := map[string]string{
		"deliveryNoteNumber": "d.Stevilka",
		"customer":           "d.ImePartnerja",
		"amount":             "d.Znesek",
		"issueDate":          "d.DatumIzstavitve",
		"deliveryDate":       "d.RokDobave",
	}
	column, ok := columns[strings.TrimSpace(*sortBy)]
	if !ok {
		return "", fmt.Errorf("unsupported delivery note sort column")
	}
	direction := strings.ToUpper(strings.TrimSpace(*sortDirection))
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return fmt.Sprintf("%s %s, d.RecNo %s", column, direction, direction), nil
}
