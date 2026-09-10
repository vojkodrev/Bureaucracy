package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type BankStatementRepository struct {
	database *sql.DB
}

func NewBankStatementRepository(database *sql.DB) *BankStatementRepository {
	return &BankStatementRepository{database: database}
}

func (repository *BankStatementRepository) Search(
	ctx context.Context,
	businessYear string,
	dateFrom *time.Time,
	dateTo *time.Time,
	statementNumber *int,
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
	arguments := []any{
		sql.Named("dateFrom", nullableTime(dateFrom)),
		sql.Named("dateTo", nullableTime(dateTo)),
		sql.Named("statementNumber", statementNumber),
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
			&entry.Outflow,
			&entry.Inflow,
			&entry.InvoiceNumber,
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
