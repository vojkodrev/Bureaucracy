package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"bureaucracy/backend/graph/model"
)

type BankStatementRepository struct {
	database *sql.DB
}

func (repository *BankStatementRepository) ListTransactionTypes(ctx context.Context, businessYear string) ([]*BankTransactionType, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	databaseName := fmt.Sprintf("BIRO%s1", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT RecNo, NumSifra, IME, VRSTA
		FROM [%s].[dbo].[BankaZRVD]
		WHERE NumSifra IS NOT NULL
		ORDER BY NumSifra, RecNo`, databaseName))
	if err != nil {
		return nil, fmt.Errorf("list bank transaction types: %w", err)
	}
	defer rows.Close()
	types := make([]*BankTransactionType, 0)
	for rows.Next() {
		transactionType := &BankTransactionType{}
		if err := rows.Scan(&transactionType.ID, &transactionType.Code, &transactionType.Name, &transactionType.Direction); err != nil {
			return nil, fmt.Errorf("scan bank transaction type: %w", err)
		}
		types = append(types, transactionType)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read bank transaction types: %w", err)
	}
	return types, nil
}

func (repository *BankStatementRepository) LatestNumber(ctx context.Context, businessYear string, bankAccount *string) (*int, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	databaseName := fmt.Sprintf("BIRO%s1", businessYear)
	account := ""
	if bankAccount != nil {
		account = strings.TrimSpace(*bankAccount)
	}
	var latest sql.NullInt64
	if err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT MAX(CAST(Stevilka AS int))
		FROM [%s].[dbo].[BankaZRSaldo]
		WHERE ISNULL(Deleted, 0) = 0 AND (@bankAccount = '' OR Racun = @bankAccount)`, databaseName),
		sql.Named("bankAccount", account)).Scan(&latest); err != nil {
		return nil, fmt.Errorf("get latest bank statement number: %w", err)
	}
	if !latest.Valid {
		return nil, nil
	}
	value := int(latest.Int64)
	return &value, nil
}

func (repository *BankStatementRepository) GetByNumber(ctx context.Context, businessYear string, number int) (*BankStatement, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if number < 1 {
		return nil, fmt.Errorf("statementNumber must be positive")
	}
	databaseName := fmt.Sprintf("BIRO%s1", businessYear)
	statement := &BankStatement{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT RecNo, Stevilka, Datum, Racun
		FROM [%s].[dbo].[BankaZRSaldo]
		WHERE Stevilka = @number AND ISNULL(Deleted, 0) = 0`, databaseName), sql.Named("number", number)).Scan(
		&statement.ID, &statement.StatementNumber, &statement.StatementDate, &statement.BankAccount)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get bank statement: %w", err)
	}

	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT transactionRow.RecNo, transactionRow.Datum, transactionRow.SifraPartnerja,
			transactionRow.ImePartnerja, transactionType.IME, transactionRow.VrstaDogodka,
			transactionRow.VBreme, transactionRow.VDobro, transactionRow.Stevilka
		FROM [%s].[dbo].[BankaZR] transactionRow
		LEFT JOIN [%s].[dbo].[BankaZRVD] transactionType
		  ON transactionType.NumSifra = transactionRow.VrstaDogodka
		WHERE transactionRow.Banka = @bankAccount
		  AND CAST(transactionRow.Datum AS date) = CAST(@statementDate AS date)
		ORDER BY transactionRow.RecNo`, databaseName, databaseName),
		sql.Named("bankAccount", statement.BankAccount), sql.Named("statementDate", statement.StatementDate))
	if err != nil {
		return nil, fmt.Errorf("get bank statement entries: %w", err)
	}
	defer rows.Close()
	statement.Entries = make([]*BankStatementEntry, 0)
	for rows.Next() {
		entry := &BankStatementEntry{StatementID: statement.ID, StatementNumber: statement.StatementNumber}
		if err := rows.Scan(&entry.ID, &entry.PaymentDate, &entry.CustomerID, &entry.CustomerName,
			&entry.TransactionType, &entry.TransactionTypeID, &entry.Outflow, &entry.Inflow,
			&entry.DocumentNumber); err != nil {
			return nil, fmt.Errorf("scan bank statement entry: %w", err)
		}
		statement.Entries = append(statement.Entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read bank statement entries: %w", err)
	}
	return statement, nil
}

func (repository *BankStatementRepository) Save(ctx context.Context, businessYear string, input model.BankStatementInput) (*BankStatement, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.BankAccount = strings.TrimSpace(input.BankAccount)
	if input.StatementNumber < 0 || input.StatementNumber > 32767 {
		return nil, fmt.Errorf("statementNumber must be between 0 and 32767")
	}
	if input.BankAccount == "" {
		return nil, fmt.Errorf("bankAccount is required")
	}
	for index, entry := range input.Entries {
		if entry == nil {
			return nil, fmt.Errorf("entry %d is required", index+1)
		}
		outflow, inflow := 0.0, 0.0
		if entry.Outflow != nil {
			outflow = *entry.Outflow
		}
		if entry.Inflow != nil {
			inflow = *entry.Inflow
		}
		if outflow < 0 || inflow < 0 || (outflow > 0 && inflow > 0) {
			return nil, fmt.Errorf("entry %d must have a non-negative outflow or inflow, not both", index+1)
		}
	}

	databaseName := fmt.Sprintf("BIRO%s1", businessYear)
	tx, err := repository.database.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin saving bank statement: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err = tx.ExecContext(ctx, "SET XACT_ABORT ON"); err != nil {
		return nil, err
	}

	statementID := 0
	var oldDate *time.Time
	var oldAccount *string
	if input.ID != nil && *input.ID > 0 {
		statementID = *input.ID
		if err = tx.QueryRowContext(ctx, fmt.Sprintf(`SELECT Datum, Racun FROM [%s].[dbo].[BankaZRSaldo] WHERE RecNo=@id`, databaseName), sql.Named("id", statementID)).Scan(&oldDate, &oldAccount); err != nil {
			return nil, fmt.Errorf("find bank statement for update: %w", err)
		}
		_, err = tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[BankaZRSaldo]
			SET Stevilka=@number, Datum=@date, Racun=@account, SaldoBreme=@outflow, SaldoDobro=@inflow, Deleted=0 WHERE RecNo=@id`, databaseName),
			sql.Named("id", statementID), sql.Named("number", input.StatementNumber), sql.Named("date", input.StatementDate), sql.Named("account", input.BankAccount),
			sql.Named("outflow", sumEntryAmounts(input.Entries, true)), sql.Named("inflow", sumEntryAmounts(input.Entries, false)))
	} else {
		err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[BankaZRSaldo]
			(Stevilka, Datum, Racun, SaldoBreme, SaldoDobro, Deleted) OUTPUT INSERTED.RecNo
			VALUES (@number, @date, @account, @outflow, @inflow, 0)`, databaseName),
			sql.Named("number", input.StatementNumber), sql.Named("date", input.StatementDate), sql.Named("account", input.BankAccount),
			sql.Named("outflow", sumEntryAmounts(input.Entries, true)), sql.Named("inflow", sumEntryAmounts(input.Entries, false))).Scan(&statementID)
	}
	if err != nil {
		return nil, fmt.Errorf("save bank statement header: %w", err)
	}

	if _, err = tx.ExecContext(ctx, "CREATE TABLE #SavedBankEntries (RecNo int NOT NULL PRIMARY KEY)"); err != nil {
		return nil, err
	}
	for _, entry := range input.Entries {
		entryID := 0
		args := []any{sql.Named("date", input.StatementDate), sql.Named("account", input.BankAccount),
			sql.Named("customerID", entry.CustomerID), sql.Named("customerName", entry.CustomerName),
			sql.Named("eventType", entry.TransactionTypeID), sql.Named("outflow", entry.Outflow),
			sql.Named("inflow", entry.Inflow), sql.Named("documentNumber", entry.DocumentNumber)}
		if entry.ID != nil && *entry.ID > 0 {
			entryID = *entry.ID
			args = append(args, sql.Named("id", entryID))
			result, updateErr := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[BankaZR]
				SET Datum=@date, Banka=@account, SifraPartnerja=@customerID, ImePartnerja=@customerName,
					VrstaDogodka=@eventType, VBreme=@outflow, VDobro=@inflow, Stevilka=@documentNumber
				WHERE RecNo=@id`, databaseName), args...)
			if updateErr != nil {
				return nil, fmt.Errorf("update bank statement entry: %w", updateErr)
			}
			if affected, _ := result.RowsAffected(); affected != 1 {
				return nil, fmt.Errorf("bank statement entry %d was not found", entryID)
			}
		} else {
			err = tx.QueryRowContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[BankaZR]
				(Datum, Banka, SifraPartnerja, ImePartnerja, VrstaDogodka, VBreme, VDobro, Stevilka, JeZR, SIT, TKDIS)
				OUTPUT INSERTED.RecNo VALUES (@date, @account, @customerID, @customerName, @eventType, @outflow, @inflow, @documentNumber, -1, -1, 0)`, databaseName), args...).Scan(&entryID)
			if err != nil {
				return nil, fmt.Errorf("insert bank statement entry: %w", err)
			}
		}
		if _, err = tx.ExecContext(ctx, "INSERT INTO #SavedBankEntries (RecNo) VALUES (@id)", sql.Named("id", entryID)); err != nil {
			return nil, err
		}
	}
	if oldDate != nil && oldAccount != nil {
		_, err = tx.ExecContext(ctx, fmt.Sprintf(`DELETE transactionRow FROM [%s].[dbo].[BankaZR] transactionRow
			WHERE transactionRow.Banka=@oldAccount AND CAST(transactionRow.Datum AS date)=CAST(@oldDate AS date)
			AND NOT EXISTS (SELECT 1 FROM #SavedBankEntries saved WHERE saved.RecNo=transactionRow.RecNo)`, databaseName),
			sql.Named("oldAccount", oldAccount), sql.Named("oldDate", oldDate))
		if err != nil {
			return nil, fmt.Errorf("remove stale bank statement entries: %w", err)
		}
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit bank statement: %w", err)
	}
	return repository.GetByNumber(ctx, businessYear, input.StatementNumber)
}

func sumEntryAmounts(entries []*model.BankStatementEntryInput, outflow bool) float64 {
	total := 0.0
	for _, entry := range entries {
		if entry == nil {
			continue
		}
		value := entry.Inflow
		if outflow {
			value = entry.Outflow
		}
		if value != nil {
			total += *value
		}
	}
	return total
}

func NewBankStatementRepository(database *sql.DB) *BankStatementRepository {
	return &BankStatementRepository{database: database}
}

func (repository *BankStatementRepository) ListAccounts(ctx context.Context, businessYear string) ([]*BankAccount, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT RecNo, COALESCE(Sifra, ''), Opis, COALESCE(StevilkaRacuna, ZR)
		FROM [%s].[dbo].[TolarskiRacuni]
		WHERE NULLIF(LTRIM(RTRIM(Sifra)), '') IS NOT NULL
		ORDER BY Sifra, RecNo`, databaseName))
	if err != nil {
		return nil, fmt.Errorf("list bank accounts: %w", err)
	}
	defer rows.Close()

	accounts := make([]*BankAccount, 0)
	for rows.Next() {
		account := &BankAccount{}
		if err := rows.Scan(&account.ID, &account.Code, &account.Name, &account.AccountNumber); err != nil {
			return nil, fmt.Errorf("scan bank account: %w", err)
		}
		accounts = append(accounts, account)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read bank accounts: %w", err)
	}
	return accounts, nil
}

func (repository *BankStatementRepository) Search(
	ctx context.Context,
	businessYear string,
	dateFrom *time.Time,
	dateTo *time.Time,
	statementNumber *int,
	bankAccount *string,
	customerID *string,
	customerName *string,
	page int,
	pageSize int,
) (*BankStatementPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 100 {
		return nil, fmt.Errorf("pageSize must be between 1 and 100")
	}
	if dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		return nil, fmt.Errorf("dateFrom must not be after dateTo")
	}
	if statementNumber != nil && *statementNumber < 0 {
		return nil, fmt.Errorf("statementNumber must not be negative")
	}

	databaseName := fmt.Sprintf("BIRO%s1", businessYear)
	bankAccountValue := ""
	if bankAccount != nil {
		bankAccountValue = strings.TrimSpace(*bankAccount)
	}
	arguments := []any{
		sql.Named("dateFrom", nullableTime(dateFrom)),
		sql.Named("dateTo", nullableTime(dateTo)),
		sql.Named("statementNumber", statementNumber),
		sql.Named("bankAccount", bankAccountValue),
		sql.Named("customerID", optionalLikePattern(customerID)),
		sql.Named("customerName", optionalLikePattern(customerName)),
	}
	transactionFilter := `
		(@dateFrom IS NULL OR transactionRow.Datum >= @dateFrom)
		AND (@dateTo IS NULL OR transactionRow.Datum < DATEADD(day, 1, @dateTo))
		AND (@customerID = '' OR transactionRow.SifraPartnerja LIKE @customerID ESCAPE '\')
		AND (@customerName = '' OR transactionRow.ImePartnerja LIKE @customerName ESCAPE '\')`

	var totalCount int
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[BankaZRSaldo] statementRow
		WHERE ISNULL(statementRow.Deleted, 0) = 0
		  AND (@statementNumber IS NULL OR statementRow.Stevilka = @statementNumber)
		  AND (@bankAccount = '' OR statementRow.Racun = @bankAccount)
		  AND EXISTS (
			SELECT 1
			FROM [%s].[dbo].[BankaZR] transactionRow
			WHERE transactionRow.Banka = statementRow.Racun
			  AND CAST(transactionRow.Datum AS date) = CAST(statementRow.Datum AS date)
			  AND %s
		  )`, databaseName, databaseName, transactionFilter), arguments...).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count bank statements: %w", err)
	}

	queryArguments := append(arguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		WITH PagedStatements AS (
			SELECT statementRow.RecNo, statementRow.Stevilka, statementRow.Datum, statementRow.Racun
			FROM [%s].[dbo].[BankaZRSaldo] statementRow
			WHERE ISNULL(statementRow.Deleted, 0) = 0
			  AND (@statementNumber IS NULL OR statementRow.Stevilka = @statementNumber)
			  AND (@bankAccount = '' OR statementRow.Racun = @bankAccount)
			  AND EXISTS (
				SELECT 1
				FROM [%s].[dbo].[BankaZR] transactionRow
				WHERE transactionRow.Banka = statementRow.Racun
				  AND CAST(transactionRow.Datum AS date) = CAST(statementRow.Datum AS date)
				  AND %s
			  )
			ORDER BY statementRow.Datum DESC, statementRow.Stevilka DESC, statementRow.RecNo DESC
			OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
		)
		SELECT
			transactionRow.RecNo,
			statementRow.RecNo,
			statementRow.Stevilka,
			transactionRow.Datum,
			transactionRow.SifraPartnerja,
			transactionRow.ImePartnerja,
			transactionType.IME,
			transactionRow.VrstaDogodka,
			transactionRow.VBreme,
			transactionRow.VDobro,
			transactionRow.Stevilka
		FROM PagedStatements statementRow
		JOIN [%s].[dbo].[BankaZR] transactionRow
		  ON transactionRow.Banka = statementRow.Racun
		 AND CAST(transactionRow.Datum AS date) = CAST(statementRow.Datum AS date)
		LEFT JOIN [%s].[dbo].[BankaZRVD] transactionType
		  ON transactionType.NumSifra = transactionRow.VrstaDogodka
		WHERE %s
		ORDER BY statementRow.Datum DESC, statementRow.Stevilka DESC,
			statementRow.RecNo DESC, transactionRow.RecNo`, databaseName, databaseName,
		transactionFilter, databaseName, databaseName, transactionFilter), queryArguments...)
	if err != nil {
		return nil, fmt.Errorf("search bank statements: %w", err)
	}
	defer rows.Close()

	entries := make([]*BankStatementEntry, 0)
	for rows.Next() {
		entry := &BankStatementEntry{}
		if err := rows.Scan(
			&entry.ID,
			&entry.StatementID,
			&entry.StatementNumber,
			&entry.PaymentDate,
			&entry.CustomerID,
			&entry.CustomerName,
			&entry.TransactionType,
			&entry.TransactionTypeID,
			&entry.Outflow,
			&entry.Inflow,
			&entry.DocumentNumber,
		); err != nil {
			return nil, fmt.Errorf("scan bank statement entry: %w", err)
		}
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read bank statements: %w", err)
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &BankStatementPage{
		Entries: entries, TotalCount: totalCount, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}
