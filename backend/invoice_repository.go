package main

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
	"bureaucracy/backend/lib"
)

type InvoiceRepository struct {
	database *sql.DB
}

var businessYearPattern = regexp.MustCompile(`^[0-9]+$`)

func NewInvoiceRepository(database *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{database: database}
}

const invoiceUpdateBatchSize = 1000
const invoicePaymentUpdateBatchSize = 500

const partialCustomerInvoicePaymentType = "Plačilo računa kupca - delni"

func (repository *InvoiceRepository) BankStatementPayments(ctx context.Context, businessYear string, invoiceNumbers []string) ([]*BankStatementInvoicePayment, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	uniqueNumbers := make([]string, 0, len(invoiceNumbers))
	seen := make(map[string]struct{}, len(invoiceNumbers))
	for _, invoiceNumber := range invoiceNumbers {
		invoiceNumber = strings.TrimSpace(invoiceNumber)
		key := strings.ToUpper(invoiceNumber)
		if invoiceNumber == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		uniqueNumbers = append(uniqueNumbers, key)
	}
	if len(uniqueNumbers) > 10000 {
		return nil, fmt.Errorf("invoiceNumbers must contain at most 10000 values")
	}

	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	payments := make([]*BankStatementInvoicePayment, 0, len(uniqueNumbers))
	for start := 0; start < len(uniqueNumbers); start += invoiceUpdateBatchSize {
		end := min(start+invoiceUpdateBatchSize, len(uniqueNumbers))
		placeholders := make([]string, 0, end-start)
		arguments := make([]any, 0, end-start)
		for index, invoiceNumber := range uniqueNumbers[start:end] {
			name := fmt.Sprintf("invoiceNumber%d", index)
			placeholders = append(placeholders, "@"+name)
			arguments = append(arguments, sql.Named(name, invoiceNumber))
		}
		rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
			SELECT LTRIM(RTRIM(invoice.Stevilka)), invoice.DatumPlacila, invoice.Znesek,
				COALESCE((
					SELECT SUM(item.Znesek)
					FROM [%s].[dbo].[DobropisSpecifikacija] item
					INNER JOIN [%s].[dbo].[Dobropis] creditNote
						ON creditNote.Stevilka = item.Stevilka
					WHERE ISNULL(item.Deleted, 0) = 0
					  AND ISNULL(creditNote.Storno, 0) = 0
					  AND UPPER(LTRIM(RTRIM(item.Racun))) =
						UPPER(LTRIM(RTRIM(invoice.Stevilka)))
				), 0),
				invoice.PlacanoSIT
			FROM [%s].[dbo].[Racuni] invoice
			WHERE UPPER(LTRIM(RTRIM(invoice.Stevilka))) IN (%s)`, databaseName, databaseName, databaseName, strings.Join(placeholders, ", ")), arguments...)
		if err != nil {
			return nil, fmt.Errorf("load invoice payments for bank statements: %w", err)
		}
		for rows.Next() {
			payment := &BankStatementInvoicePayment{}
			if err := rows.Scan(&payment.InvoiceNumber, &payment.PaymentDate, &payment.Amount, &payment.CreditedAmount, &payment.PaidAmount); err != nil {
				rows.Close()
				return nil, fmt.Errorf("scan invoice payment for bank statements: %w", err)
			}
			payments = append(payments, payment)
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return nil, fmt.Errorf("read invoice payments for bank statements: %w", err)
		}
		rows.Close()
	}
	return payments, nil
}

func clearPaidInvoices(ctx context.Context, tx *sql.Tx, businessYear string, invoiceNumbers []string) error {
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	uniqueNumbers := make([]string, 0, len(invoiceNumbers))
	seen := make(map[string]struct{}, len(invoiceNumbers))
	for _, invoiceNumber := range invoiceNumbers {
		invoiceNumber = strings.TrimSpace(invoiceNumber)
		if invoiceNumber == "" {
			continue
		}
		if _, exists := seen[invoiceNumber]; exists {
			continue
		}
		seen[invoiceNumber] = struct{}{}
		uniqueNumbers = append(uniqueNumbers, invoiceNumber)
	}

	for start := 0; start < len(uniqueNumbers); start += invoiceUpdateBatchSize {
		end := min(start+invoiceUpdateBatchSize, len(uniqueNumbers))
		placeholders := make([]string, 0, end-start)
		arguments := make([]any, 0, end-start)
		for index, invoiceNumber := range uniqueNumbers[start:end] {
			name := fmt.Sprintf("invoiceNumber%d", index)
			placeholders = append(placeholders, "@"+name)
			arguments = append(arguments, sql.Named(name, invoiceNumber))
		}
		query := fmt.Sprintf(`UPDATE [%s].[dbo].[Racuni]
			SET DatumPlacila=NULL, PlacanoSIT=NULL
			WHERE LTRIM(RTRIM(Stevilka)) IN (%s)`, databaseName, strings.Join(placeholders, ", "))
		if _, err := tx.ExecContext(ctx, query, arguments...); err != nil {
			return fmt.Errorf("clear paid invoices: %w", err)
		}
	}
	return nil
}

// updatePaidInvoices synchronizes incoming bank statement entries with issued
// invoices. Partial customer payments are aggregated across bank statements and
// use the latest transaction date. Other payments keep the existing behavior:
// their date is set only when the paid amount matches the invoice total. An
// unmatched document number is allowed because bank statements can also contain
// transactions that do not belong to an invoice.
func updatePaidInvoices(ctx context.Context, tx *sql.Tx, businessYear string, paymentDate time.Time, entries []*model.BankStatementEntryInput, oldInvoiceNumbers []string) error {
	type invoicePayment struct {
		invoiceNumber string
		paidAmount    float64
		paymentDate   time.Time
		partial       bool
		aggregate     bool
		current       bool
	}

	bankDatabaseName := fmt.Sprintf("BIRO%s1", businessYear)
	var partialPaymentCode sql.NullInt64
	if err := tx.QueryRowContext(ctx, fmt.Sprintf(`SELECT MAX(NumSifra)
		FROM [%s].[dbo].[BankaZRVD]
		WHERE IME=@partialPaymentType`, bankDatabaseName),
		sql.Named("partialPaymentType", partialCustomerInvoicePaymentType)).Scan(&partialPaymentCode); err != nil {
		return fmt.Errorf("find partial customer invoice payment type: %w", err)
	}

	payments := make([]invoicePayment, 0, len(entries)+len(oldInvoiceNumbers))
	paymentIndexes := make(map[string]int, len(entries)+len(oldInvoiceNumbers))
	addPayment := func(invoiceNumber string, paidAmount float64, date time.Time, aggregate bool, current bool) {
		invoiceNumber = strings.TrimSpace(invoiceNumber)
		key := strings.ToUpper(invoiceNumber)
		if key == "" {
			return
		}
		payment := invoicePayment{invoiceNumber: invoiceNumber, paidAmount: paidAmount, paymentDate: date, aggregate: aggregate, current: current}
		if index, exists := paymentIndexes[key]; exists {
			payments[index] = payment
			return
		}
		paymentIndexes[key] = len(payments)
		payments = append(payments, payment)
	}
	for _, entry := range entries {
		if entry == nil || entry.DocumentNumber == nil || entry.Inflow == nil || *entry.Inflow <= 0 {
			continue
		}
		aggregate := partialPaymentCode.Valid && entry.TransactionTypeID != nil && int64(*entry.TransactionTypeID) == partialPaymentCode.Int64
		addPayment(*entry.DocumentNumber, *entry.Inflow, paymentDate, aggregate, true)
	}
	for _, invoiceNumber := range oldInvoiceNumbers {
		key := strings.ToUpper(strings.TrimSpace(invoiceNumber))
		if _, exists := paymentIndexes[key]; !exists {
			addPayment(invoiceNumber, 0, paymentDate, true, false)
		}
	}

	aggregatePayments := make([]invoicePayment, 0, len(payments))
	for _, payment := range payments {
		if payment.aggregate {
			aggregatePayments = append(aggregatePayments, payment)
		}
	}
	for start := 0; start < len(aggregatePayments); start += invoiceUpdateBatchSize {
		end := min(start+invoiceUpdateBatchSize, len(aggregatePayments))
		placeholders := make([]string, 0, end-start)
		arguments := make([]any, 0, end-start+1)
		arguments = append(arguments, sql.Named("partialPaymentType", partialCustomerInvoicePaymentType))
		for index, payment := range aggregatePayments[start:end] {
			name := fmt.Sprintf("invoiceNumber%d", index)
			placeholders = append(placeholders, "@"+name)
			arguments = append(arguments, sql.Named(name, strings.ToUpper(payment.invoiceNumber)))
		}
		rows, err := tx.QueryContext(ctx, fmt.Sprintf(`SELECT UPPER(LTRIM(RTRIM(transactionRow.Stevilka))),
			SUM(transactionRow.VDobro), MAX(transactionRow.Datum)
			FROM [%s].[dbo].[BankaZR] transactionRow
			INNER JOIN [%s].[dbo].[BankaZRVD] transactionType
				ON transactionType.NumSifra=transactionRow.VrstaDogodka
			WHERE transactionType.IME=@partialPaymentType
				AND transactionRow.VDobro > 0
				AND UPPER(LTRIM(RTRIM(transactionRow.Stevilka))) IN (%s)
			GROUP BY UPPER(LTRIM(RTRIM(transactionRow.Stevilka)))`, bankDatabaseName, bankDatabaseName, strings.Join(placeholders, ", ")), arguments...)
		if err != nil {
			return fmt.Errorf("aggregate partial customer invoice payments: %w", err)
		}
		for rows.Next() {
			var invoiceNumber string
			var paidAmount float64
			var latestPaymentDate time.Time
			if err := rows.Scan(&invoiceNumber, &paidAmount, &latestPaymentDate); err != nil {
				rows.Close()
				return fmt.Errorf("scan partial customer invoice payments: %w", err)
			}
			if index, exists := paymentIndexes[invoiceNumber]; exists {
				payments[index].paidAmount = paidAmount
				payments[index].paymentDate = latestPaymentDate
				payments[index].partial = true
			}
		}
		if err := rows.Err(); err != nil {
			rows.Close()
			return fmt.Errorf("read partial customer invoice payments: %w", err)
		}
		rows.Close()
	}
	updatedPayments := payments[:0]
	for _, payment := range payments {
		if payment.current || payment.partial {
			updatedPayments = append(updatedPayments, payment)
		}
	}
	payments = updatedPayments

	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	for start := 0; start < len(payments); start += invoicePaymentUpdateBatchSize {
		end := min(start+invoicePaymentUpdateBatchSize, len(payments))
		values := make([]string, 0, end-start)
		arguments := make([]any, 0, (end-start)*4)
		for index, payment := range payments[start:end] {
			numberName := fmt.Sprintf("invoiceNumber%d", index)
			amountName := fmt.Sprintf("paidAmount%d", index)
			dateName := fmt.Sprintf("paymentDate%d", index)
			partialName := fmt.Sprintf("partial%d", index)
			values = append(values, fmt.Sprintf("(@%s, @%s, @%s, @%s)", numberName, amountName, dateName, partialName))
			arguments = append(arguments, sql.Named(numberName, payment.invoiceNumber), sql.Named(amountName, payment.paidAmount), sql.Named(dateName, payment.paymentDate), sql.Named(partialName, payment.partial))
		}
		query := fmt.Sprintf(`UPDATE invoice
			SET invoice.PlacanoSIT=payment.PaidAmount,
				invoice.DatumPlacila=CASE
					WHEN payment.IsPartial=1 THEN payment.PaymentDate
					WHEN invoice.Znesek IS NOT NULL AND ROUND(invoice.Znesek + COALESCE((
						SELECT SUM(item.Znesek)
						FROM [%s].[dbo].[DobropisSpecifikacija] item
						INNER JOIN [%s].[dbo].[Dobropis] creditNote
							ON creditNote.Stevilka = item.Stevilka
						WHERE ISNULL(item.Deleted, 0) = 0
						  AND ISNULL(creditNote.Storno, 0) = 0
						  AND UPPER(LTRIM(RTRIM(item.Racun))) =
							UPPER(LTRIM(RTRIM(invoice.Stevilka)))
					), 0), 2)=ROUND(payment.PaidAmount, 2)
					THEN payment.PaymentDate
					ELSE NULL
				END
			FROM [%s].[dbo].[Racuni] invoice
			INNER JOIN (VALUES %s) payment(InvoiceNumber, PaidAmount, PaymentDate, IsPartial)
				ON UPPER(LTRIM(RTRIM(invoice.Stevilka)))=UPPER(payment.InvoiceNumber)`, databaseName, databaseName, databaseName, strings.Join(values, ", "))
		if _, err := tx.ExecContext(ctx, query, arguments...); err != nil {
			return fmt.Errorf("update paid invoices: %w", err)
		}
	}
	return nil
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
				Narocilnica=@purchaseOrderNumber, StevilkaDobavnice=@deliveryNoteNumber,
				SpremniText=@introductoryText, Klavzula=@closingText, Znesek=@amount, ZnesekBlaga=NULL
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
				ImePartnerja, NaslovPartnerja, KrajPartnerja, PlacanoSIT, Narocilnica, StevilkaDobavnice,
				SpremniText, Klavzula, Znesek, Storno
			) OUTPUT INSERTED.RecNo VALUES (
				@invoiceNumber, @issueDate, @serviceDate, @dueDate, @paymentDate, @customerCode,
				@customerName, @customerAddress, @customerCity, @paidAmount, @purchaseOrderNumber, @deliveryNoteNumber,
				@introductoryText, @closingText, @amount, 0
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
	amount := 0.0
	for _, item := range input.Items {
		if item.GrossAmount != nil {
			amount += lib.RoundCurrency(*item.GrossAmount)
		}
	}
	return []any{
		sql.Named("id", id), sql.Named("invoiceNumber", input.InvoiceNumber),
		sql.Named("issueDate", nullableInputTime(input.IssueDate)), sql.Named("serviceDate", nullableInputTime(input.ServiceDate)),
		sql.Named("dueDate", nullableInputTime(input.DueDate)), sql.Named("paymentDate", nullableInputTime(input.PaymentDate)),
		sql.Named("customerCode", input.CustomerCode),
		sql.Named("customerName", input.CustomerName), sql.Named("customerAddress", input.CustomerAddress),
		sql.Named("customerCity", input.CustomerCity), sql.Named("paidAmount", input.PaidAmount),
		sql.Named("purchaseOrderNumber", input.PurchaseOrderNumber),
		sql.Named("deliveryNoteNumber", input.DeliveryNoteNumber),
		sql.Named("introductoryText", input.IntroductoryText), sql.Named("closingText", input.ClosingText),
		sql.Named("amount", lib.RoundCurrency(amount)),
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
			COALESCE(NULLIF(LTRIM(RTRIM(d.Drzava)), ''), p.Drzava, ''),
			p.IDStevilka,
			p.MaticnaStevilka,
			p.Ziro_Racun,
			p.Ziro_Racun1,
			r.KrajIzdaje,
			r.KontaktPartnerja,
			r.Valuta,
			r.Znesek,
			COALESCE((
				SELECT SUM(ds.Znesek)
				FROM [%s].[dbo].[DobropisSpecifikacija] ds
				INNER JOIN [%s].[dbo].[Dobropis] d ON d.Stevilka = ds.Stevilka
				WHERE ISNULL(ds.Deleted, 0) = 0
				  AND ISNULL(d.Storno, 0) = 0
				  AND UPPER(LTRIM(RTRIM(ds.Racun))) = UPPER(LTRIM(RTRIM(r.Stevilka)))
			), 0),
			r.PlacanoSIT,
			r.Narocilnica,
			r.StevilkaDobavnice,
			r.Sklic,
			r.SpremniText,
			r.Klavzula,
			r.Storno
		FROM [%s].[dbo].[Racuni] r
		LEFT JOIN [%s].[dbo].[Partner] p ON p.Sifra = r.SifraPartnerja
		LEFT JOIN [%s].[dbo].[Drzave] d ON d.OznakaDrzave = p.Drzava AND ISNULL(d.Deleted, 0) = 0
		WHERE r.Stevilka = @invoiceNumber`, invoiceDatabaseName, invoiceDatabaseName, invoiceDatabaseName, customerDatabaseName, customerDatabaseName),
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
		&invoice.CustomerCountryName,
		&invoice.CustomerTaxID,
		&invoice.CustomerRegistrationNumber,
		&invoice.CustomerIBAN,
		&invoice.CustomerBIC,
		&invoice.IssuePlace,
		&invoice.CustomerContact,
		&invoice.Currency,
		&invoice.Amount,
		&invoice.CreditedAmount,
		&invoice.PaidAmount,
		&invoice.PurchaseOrderNumber,
		&invoice.DeliveryNoteNumber,
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
	netTotal := lib.RoundCurrency(sumInvoiceNet(items))
	invoice.NetTotal = &netTotal
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
			(rs.ZnesekBrezDavka / NULLIF(rs.Kolicina, 0)) *
				(CAST(COALESCE(pd.Procent, a.Davek) AS float) / 100),
			rs.Kolicina,
			CAST(rs.Rabat AS float),
			-- ZnesekBrezDavka is the persisted, rounded pre-discount amount. Keep
			-- the derived taxable amount at currency precision for every consumer,
			-- including the invoice editor and FURS reporting.
			ROUND(rs.ZnesekBrezDavka *
				(1 - COALESCE(CAST(rs.Rabat AS float), 0) / 100), 2),
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
	productCode *string,
	productName *string,
	issuedFrom *time.Time,
	issuedTo *time.Time,
	paymentStatus *string,
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
	if pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("pageSize must be between 1 and 10000")
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		return nil, fmt.Errorf("issuedFrom must not be after issuedTo")
	}
	status, err := invoicePaymentStatus(paymentStatus)
	if err != nil {
		return nil, err
	}
	orderBy, err := invoiceOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	invoiceNumberPattern := lib.OptionalLikePattern(invoiceNumber)
	customerIDPattern := lib.OptionalLikePattern(customerID)
	customerNamePattern := lib.WordsLikePattern(customerName)
	productCodePattern := lib.OptionalLikePattern(productCode)
	productNamePattern := lib.WordsLikePattern(productName)
	queryArguments := []any{
		sql.Named("invoiceNumber", invoiceNumberPattern),
		sql.Named("customerID", customerIDPattern),
		sql.Named("customerName", customerNamePattern),
		sql.Named("productCode", productCodePattern),
		sql.Named("productName", productNamePattern),
		sql.Named("issuedFrom", nullableTime(issuedFrom)),
		sql.Named("issuedTo", nullableTime(issuedTo)),
		sql.Named("paymentStatus", status),
	}
	databaseName := fmt.Sprintf("BIRO%s5", businessYear)
	productDatabaseName := fmt.Sprintf("BIRO%s3", businessYear)

	var totalCount int
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[Racuni]
		WHERE (@invoiceNumber = '' OR Stevilka LIKE @invoiceNumber ESCAPE '\')
		  AND (@customerID = '' OR SifraPartnerja LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR ImePartnerja LIKE @customerName ESCAPE '\')
		  AND ((@productCode = '' AND @productName = '') OR EXISTS (
		      SELECT 1
		      FROM [%s].[dbo].[RacuniSpecifikacija] rs
		      LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = rs.Artikel
		      WHERE rs.Stevilka = Racuni.Stevilka
		        AND ISNULL(rs.Deleted, 0) = 0
		        AND (@productCode = '' OR rs.Artikel LIKE @productCode ESCAPE '\')
		        AND (@productName = '' OR a.Opis LIKE @productName ESCAPE '\')
		  ))
		  AND (@issuedFrom IS NULL OR DatumIzstavitve >= @issuedFrom)
		  AND (@issuedTo IS NULL OR DatumIzstavitve < DATEADD(day, 1, @issuedTo))
		  AND (@paymentStatus = 'all'
		    OR (@paymentStatus = 'overdue' AND DatumPlacila IS NULL AND COALESCE(DatumZapadlosti, DatumIzstavitve) < CAST(GETDATE() AS date))
		    OR (@paymentStatus = 'paid' AND DatumPlacila IS NOT NULL)
		    OR (@paymentStatus = 'unpaid' AND DatumPlacila IS NULL))`, databaseName, databaseName, productDatabaseName),
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
			COALESCE((
				SELECT SUM(ds.Znesek)
				FROM [%s].[dbo].[DobropisSpecifikacija] ds
				INNER JOIN [%s].[dbo].[Dobropis] d ON d.Stevilka = ds.Stevilka
				WHERE ISNULL(ds.Deleted, 0) = 0
				  AND ISNULL(d.Storno, 0) = 0
				  AND UPPER(LTRIM(RTRIM(ds.Racun))) = UPPER(LTRIM(RTRIM(Racuni.Stevilka)))
			), 0),
			COALESCE((
				SELECT SUM(ROUND(rs.ZnesekBrezDavka *
					(1 - COALESCE(CAST(rs.Rabat AS float), 0) / 100), 2))
				FROM [%s].[dbo].[RacuniSpecifikacija] rs
				WHERE rs.Stevilka = Racuni.Stevilka
				  AND ISNULL(rs.Deleted, 0) = 0
			), 0),
			PlacanoSIT,
			Sklic,
			Storno
		FROM [%s].[dbo].[Racuni]
		WHERE (@invoiceNumber = '' OR Stevilka LIKE @invoiceNumber ESCAPE '\')
		  AND (@customerID = '' OR SifraPartnerja LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR ImePartnerja LIKE @customerName ESCAPE '\')
		  AND ((@productCode = '' AND @productName = '') OR EXISTS (
		      SELECT 1
		      FROM [%s].[dbo].[RacuniSpecifikacija] rs
		      LEFT JOIN [%s].[dbo].[Artikel] a ON a.Artikel = rs.Artikel
		      WHERE rs.Stevilka = Racuni.Stevilka
		        AND ISNULL(rs.Deleted, 0) = 0
		        AND (@productCode = '' OR rs.Artikel LIKE @productCode ESCAPE '\')
		        AND (@productName = '' OR a.Opis LIKE @productName ESCAPE '\')
		  ))
		  AND (@issuedFrom IS NULL OR DatumIzstavitve >= @issuedFrom)
		  AND (@issuedTo IS NULL OR DatumIzstavitve < DATEADD(day, 1, @issuedTo))
		  AND (@paymentStatus = 'all'
		    OR (@paymentStatus = 'overdue' AND DatumPlacila IS NULL AND COALESCE(DatumZapadlosti, DatumIzstavitve) < CAST(GETDATE() AS date))
		    OR (@paymentStatus = 'paid' AND DatumPlacila IS NOT NULL)
		    OR (@paymentStatus = 'unpaid' AND DatumPlacila IS NULL))
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, databaseName, databaseName, databaseName, databaseName, productDatabaseName, orderBy),
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
			&invoice.CreditedAmount,
			&invoice.NetTotal,
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

func invoicePaymentStatus(value *string) (string, error) {
	if value == nil || strings.TrimSpace(*value) == "" {
		return "all", nil
	}
	status := strings.ToLower(strings.TrimSpace(*value))
	if status != "all" && status != "overdue" && status != "paid" && status != "unpaid" {
		return "", fmt.Errorf("paymentStatus must be all, overdue, paid, or unpaid")
	}
	return status, nil
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
