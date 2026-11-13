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

type CreditNoteRepository struct{ database *sql.DB }

func NewCreditNoteRepository(database *sql.DB) *CreditNoteRepository {
	return &CreditNoteRepository{database: database}
}

func (repository *CreditNoteRepository) GetByNumber(
	ctx context.Context,
	businessYear string,
	number string,
) (*CreditNote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	number = strings.TrimSpace(number)
	if number == "" {
		return nil, fmt.Errorf("creditNoteNumber is required")
	}
	documentDatabase, masterDatabase := fmt.Sprintf("BIRO%s5", businessYear), fmt.Sprintf("BIRO%s3", businessYear)
	note := &CreditNote{}
	var cancelled sql.NullInt16
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`SELECT d.RecNo, COALESCE(d.Stevilka,''),
		d.DatumIzstavitve, d.DatumDUR, d.DatumZapadlosti, d.SifraPartnerja,
		COALESCE(NULLIF(LTRIM(RTRIM(d.ImePartnerja)),''), p.Partner,''),
		COALESCE(NULLIF(LTRIM(RTRIM(d.NaslovPartnerja)),''), p.Ulica,''), p.Posta,
		d.KrajPartnerja, p.Drzava, COALESCE(NULLIF(LTRIM(RTRIM(dr.Drzava)),''),p.Drzava,''),
		p.IDStevilka, d.KrajIzdaje, d.Valuta, d.Znesek,
		d.SpremniText, d.Klavzula, d.Storno
		FROM [%s].[dbo].[Dobropis] d
		LEFT JOIN [%s].[dbo].[Partner] p ON p.Sifra=d.SifraPartnerja
		LEFT JOIN [%s].[dbo].[Drzave] dr ON dr.OznakaDrzave=p.Drzava AND ISNULL(dr.Deleted,0)=0
		WHERE d.Stevilka=@number`, documentDatabase, masterDatabase, masterDatabase), sql.Named("number", number)).Scan(
		&note.ID, &note.CreditNoteNumber, &note.IssueDate, &note.ServiceDate, &note.DueDate,
		&note.CustomerCode, &note.CustomerName, &note.CustomerAddress, &note.CustomerPostalCode,
		&note.CustomerCity, &note.CustomerCountry, &note.CustomerCountryName, &note.CustomerTaxID,
		&note.IssuePlace, &note.Currency, &note.Amount,
		&note.IntroductoryText, &note.ClosingText, &cancelled)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get credit note: %w", err)
	}
	if cancelled.Valid {
		value := cancelled.Int16 != 0
		note.Cancelled = &value
	}
	note.Items, err = repository.getItems(ctx, documentDatabase, masterDatabase, number)
	if err != nil {
		return nil, err
	}
	netTotal := lib.RoundCurrency(sumInvoiceNet(note.Items))
	note.NetTotal = &netTotal
	return note, nil
}

func (repository *CreditNoteRepository) getItems(
	ctx context.Context,
	documentDatabase string,
	masterDatabase string,
	number string,
) ([]*InvoiceItem, error) {
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`SELECT ds.RecNo, ds.Zaporedje,
		ds.Artikel, a.Opis, COALESCE(ds.Enota,a.Enota), ds.SifraDavka,
		CAST(COALESCE(pd.Procent,a.Davek) AS float),
		ds.ZnesekBrezDavka/NULLIF(ds.Kolicina,0),
		(ds.ZnesekBrezDavka/NULLIF(ds.Kolicina,0))*(CAST(COALESCE(pd.Procent,a.Davek) AS float)/100),
		ds.Kolicina, CAST(ds.Rabat AS float),
		ROUND(ds.ZnesekBrezDavka*(1-COALESCE(CAST(ds.Rabat AS float),0)/100),2),
		ds.Znesek, ds.Racun
		FROM [%s].[dbo].[DobropisSpecifikacija] ds
		LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel=ds.Artikel
		LEFT JOIN [%s].[dbo].[PrometniDavek] pd ON pd.Sifra=ds.SifraDavka
		WHERE ds.Stevilka=@number AND ISNULL(ds.Deleted,0)=0
		ORDER BY ds.Zaporedje, ds.RecNo`, documentDatabase, masterDatabase, masterDatabase), sql.Named("number", number))
	if err != nil {
		return nil, fmt.Errorf("get credit note items: %w", err)
	}
	defer rows.Close()
	items := make([]*InvoiceItem, 0)
	for rows.Next() {
		item := &InvoiceItem{}
		if err = rows.Scan(&item.ID, &item.Sequence, &item.ProductCode, &item.ProductName, &item.Unit,
			&item.TaxCode, &item.TaxRate, &item.UnitPrice, &item.UnitTaxAmount, &item.Quantity,
			&item.Discount, &item.NetAmount, &item.GrossAmount, &item.OriginalInvoiceNumber); err != nil {
			return nil, fmt.Errorf("scan credit note item: %w", err)
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("read credit note items: %w", err)
	}
	return items, nil
}

func (repository *CreditNoteRepository) Save(
	ctx context.Context,
	businessYear string,
	input model.CreditNoteInput,
) (*CreditNote, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.CreditNoteNumber = strings.TrimSpace(input.CreditNoteNumber)
	if input.CreditNoteNumber == "" {
		return nil, fmt.Errorf("creditNoteNumber is required")
	}
	for index, item := range input.Items {
		if item == nil || strings.TrimSpace(item.ProductCode) == "" {
			return nil, fmt.Errorf("productCode is required for credit note item %d", index+1)
		}
		if strings.TrimSpace(item.TaxCode) == "" {
			return nil, fmt.Errorf("taxCode is required for credit note item %d", index+1)
		}
		if item.NetAmount != nil {
			value := lib.RoundCurrency(*item.NetAmount)
			item.NetAmount = &value
		}
		if item.GrossAmount != nil {
			value := lib.RoundCurrency(*item.GrossAmount)
			item.GrossAmount = &value
		}
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin saving credit note: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err = tx.ExecContext(ctx, "SET XACT_ABORT ON"); err != nil {
		return nil, err
	}
	oldNumber, id := input.CreditNoteNumber, 0
	if input.ID != nil && *input.ID > 0 {
		id = *input.ID
		findQuery := fmt.Sprintf(
			"SELECT COALESCE(Stevilka,'') FROM [%s].[dbo].[Dobropis] WHERE RecNo=@id",
			databaseName,
		)
		if err = tx.QueryRowContext(ctx, findQuery, sql.Named("id", id)).Scan(&oldNumber); err != nil {
			return nil, fmt.Errorf("find credit note for update: %w", err)
		}
		_, err = tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[Dobropis] SET Stevilka=@number,
			DatumIzstavitve=@issueDate, DatumDUR=@serviceDate, DatumZapadlosti=@dueDate,
			SifraPartnerja=@customerCode, ImePartnerja=@customerName, NaslovPartnerja=@customerAddress,
			KrajPartnerja=@customerCity, SpremniText=@introductoryText, Klavzula=@closingText,
			Znesek=@amount, ZnesekBlaga=NULL WHERE RecNo=@id`, databaseName), creditNoteArguments(input, id)...)
	} else {
		err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[Dobropis]
			(Stevilka,DatumIzstavitve,DatumDUR,DatumZapadlosti,SifraPartnerja,ImePartnerja,NaslovPartnerja,
			KrajPartnerja,SpremniText,Klavzula,Znesek,Storno,VrstaDobropisa)
			OUTPUT INSERTED.RecNo VALUES (@number,@issueDate,@serviceDate,@dueDate,@customerCode,@customerName,
			@customerAddress,@customerCity,@introductoryText,@closingText,@amount,0,0)`,
			databaseName,
		), creditNoteArguments(input, 0)...).Scan(&id)
	}
	if err != nil {
		return nil, fmt.Errorf("save credit note: %w", err)
	}
	if _, err = tx.ExecContext(ctx, "CREATE TABLE #SavedCreditNoteItems (RecNo int NOT NULL PRIMARY KEY)"); err != nil {
		return nil, err
	}
	for index, item := range input.Items {
		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		itemID := 0
		args := creditNoteItemArguments(input, item, sequence, oldNumber)
		if item.ID != nil && *item.ID > 0 {
			itemID = *item.ID
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[DobropisSpecifikacija]
				SET Stevilka=@number,Zaporedje=@sequence,Artikel=@productCode,Datum=@issueDate,Kolicina=@quantity,
				Rabat=@discount,ZnesekBrezDavka=@netAmount,Znesek=@grossAmount,Deleted=0,SifraDavka=@taxCode,Racun=@originalInvoiceNumber
				WHERE RecNo=@id AND Stevilka IN (@oldNumber,@number)`, databaseName), append(args, sql.Named("id", itemID))...)
			if updateErr != nil {
				return nil, fmt.Errorf("update credit note item %d: %w", index+1, updateErr)
			}
			affected, _ := result.RowsAffected()
			if affected != 1 {
				return nil, fmt.Errorf("credit note item RecNo %d was not found", itemID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[DobropisSpecifikacija]
				(Stevilka,Zaporedje,Artikel,Datum,Kolicina,Rabat,ZnesekBrezDavka,Znesek,Deleted,SifraDavka,Racun)
				OUTPUT INSERTED.RecNo VALUES (@number,@sequence,@productCode,@issueDate,@quantity,@discount,
				@netAmount,@grossAmount,0,@taxCode,@originalInvoiceNumber)`, databaseName), args...).Scan(&itemID)
			if err != nil {
				return nil, fmt.Errorf("insert credit note item %d: %w", index+1, err)
			}
		}
		if _, err = tx.ExecContext(
			ctx,
			"INSERT INTO #SavedCreditNoteItems (RecNo) VALUES (@id)",
			sql.Named("id", itemID),
		); err != nil {
			return nil, err
		}
	}
	deleteQuery := fmt.Sprintf(`DELETE item FROM [%s].[dbo].[DobropisSpecifikacija] item
		WHERE item.Stevilka IN (@oldNumber,@number) AND NOT EXISTS
		(SELECT 1 FROM #SavedCreditNoteItems saved WHERE saved.RecNo=item.RecNo)`, databaseName)
	if _, err = tx.ExecContext(
		ctx,
		deleteQuery,
		sql.Named("oldNumber", oldNumber),
		sql.Named("number", input.CreditNoteNumber),
	); err != nil {
		return nil, err
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit credit note: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.CreditNoteNumber)
}

func creditNoteArguments(input model.CreditNoteInput, id int) []any {
	amount := 0.0
	for _, item := range input.Items {
		if item.GrossAmount != nil {
			amount += lib.RoundCurrency(*item.GrossAmount)
		}
	}
	return []any{
		sql.Named("id", id),
		sql.Named("number", input.CreditNoteNumber),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)),
		sql.Named("serviceDate", nullableInputTime(input.ServiceDate)),
		sql.Named("dueDate", nullableInputTime(input.DueDate)),
		sql.Named("customerCode", input.CustomerCode),
		sql.Named("customerName", input.CustomerName),
		sql.Named("customerAddress", input.CustomerAddress),
		sql.Named("customerCity", input.CustomerCity),
		sql.Named("introductoryText", input.IntroductoryText),
		sql.Named("closingText", input.ClosingText),
		sql.Named("amount", lib.RoundCurrency(amount)),
	}
}

func creditNoteItemArguments(
	input model.CreditNoteInput,
	item *model.CreditNoteItemInput,
	sequence int,
	oldNumber string,
) []any {
	return []any{
		sql.Named("oldNumber", oldNumber),
		sql.Named("number", input.CreditNoteNumber),
		sql.Named("sequence", sequence),
		sql.Named("productCode", strings.TrimSpace(item.ProductCode)),
		sql.Named("taxCode", strings.TrimSpace(item.TaxCode)),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)),
		sql.Named("quantity", item.Quantity),
		sql.Named("discount", item.Discount),
		sql.Named("netAmount", item.NetAmount),
		sql.Named("grossAmount", item.GrossAmount),
		sql.Named("originalInvoiceNumber", item.OriginalInvoiceNumber),
	}
}

func (repository *CreditNoteRepository) Search(
	ctx context.Context,
	businessYear string,
	number *string,
	customerID *string,
	customerName *string,
	productCode *string,
	productName *string,
	originalInvoiceNumber *string,
	issuedFrom *time.Time,
	issuedTo *time.Time,
	sortBy *string,
	sortDirection *string,
	page int,
	pageSize int,
) (*CreditNotePage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 || pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("invalid pagination")
	}
	orderBy, err := creditNoteOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}
	db, master := fmt.Sprintf("BIRO%s5", businessYear), fmt.Sprintf("BIRO%s3", businessYear)
	args := []any{
		sql.Named("number", lib.OptionalLikePattern(number)),
		sql.Named("customerID", lib.OptionalLikePattern(customerID)),
		sql.Named("customerName", lib.OptionalLikePattern(customerName)),
		sql.Named("productCode", lib.OptionalLikePattern(productCode)),
		sql.Named("productName", lib.WordsLikePattern(productName)),
		sql.Named("originalInvoiceNumber", lib.OptionalLikePattern(originalInvoiceNumber)),
		sql.Named("issuedFrom", nullableTime(issuedFrom)),
		sql.Named("issuedTo", nullableTime(issuedTo)),
	}
	where := fmt.Sprintf(`WHERE (@number='' OR d.Stevilka LIKE @number ESCAPE '\')
		AND (@customerID='' OR d.SifraPartnerja LIKE @customerID ESCAPE '\')
		AND (@customerName='' OR d.ImePartnerja LIKE @customerName ESCAPE '\')
		AND ((@productCode='' AND @productName='' AND @originalInvoiceNumber='') OR EXISTS (
			SELECT 1 FROM [%s].[dbo].[DobropisSpecifikacija] ds
			LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel=ds.Artikel
			WHERE ds.Stevilka=d.Stevilka AND ISNULL(ds.Deleted,0)=0
				AND (@productCode='' OR ds.Artikel LIKE @productCode ESCAPE '\')
				AND (@productName='' OR a.Opis LIKE @productName ESCAPE '\')
				AND (@originalInvoiceNumber='' OR ds.Racun LIKE @originalInvoiceNumber ESCAPE '\')
		))
		AND (@issuedFrom IS NULL OR d.DatumIzstavitve>=@issuedFrom)
		AND (@issuedTo IS NULL OR d.DatumIzstavitve<DATEADD(day,1,@issuedTo))`, db, master)
	var count int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM [%s].[dbo].[Dobropis] d %s", db, where)
	if err = repository.database.QueryRowContext(ctx, countQuery, args...).Scan(&count); err != nil {
		return nil, fmt.Errorf("count credit notes: %w", err)
	}
	args = append(args, sql.Named("offset", (page-1)*pageSize), sql.Named("pageSize", pageSize))
	searchQuery := fmt.Sprintf(`SELECT d.RecNo, COALESCE(d.Stevilka,''), d.DatumIzstavitve,
		d.DatumDUR, d.DatumZapadlosti, d.SifraPartnerja, d.ImePartnerja, d.Valuta, d.Znesek
		FROM [%s].[dbo].[Dobropis] d %s
		ORDER BY %s OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, db, where, orderBy)
	rows, err := repository.database.QueryContext(ctx, searchQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("search credit notes: %w", err)
	}
	defer rows.Close()
	notes := make([]*CreditNote, 0)
	for rows.Next() {
		n := &CreditNote{}
		if err = rows.Scan(
			&n.ID,
			&n.CreditNoteNumber,
			&n.IssueDate,
			&n.ServiceDate,
			&n.DueDate,
			&n.CustomerCode,
			&n.CustomerName,
			&n.Currency,
			&n.Amount,
		); err != nil {
			return nil, err
		}
		notes = append(notes, n)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	pages := 0
	if count > 0 {
		pages = (count + pageSize - 1) / pageSize
	}
	return &CreditNotePage{CreditNotes: notes, TotalCount: count, Page: page, PageSize: pageSize, TotalPages: pages}, nil
}

func creditNoteOrderBy(sortBy, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "d.Stevilka, d.RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}
	columns := map[string]string{
		"creditNoteNumber": "d.Stevilka",
		"customer":         "d.ImePartnerja",
		"amount":           "d.Znesek",
		"issueDate":        "d.DatumIzstavitve",
		"dueDate":          "d.DatumZapadlosti",
	}
	column, ok := columns[strings.TrimSpace(*sortBy)]
	if !ok {
		return "", fmt.Errorf("unsupported credit note sort column")
	}
	direction := strings.ToUpper(strings.TrimSpace(*sortDirection))
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return fmt.Sprintf("%s %s, d.RecNo %s", column, direction, direction), nil
}
