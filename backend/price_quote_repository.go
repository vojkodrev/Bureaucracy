package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type PriceQuoteRepository struct{ database *sql.DB }

func NewPriceQuoteRepository(database *sql.DB) *PriceQuoteRepository {
	return &PriceQuoteRepository{database: database}
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
	if err = repository.database.QueryRowContext(ctx,
		fmt.Sprintf("SELECT COUNT(*) FROM [%s].[dbo].[Predracuni] p %s", databaseName, where), arguments...).Scan(&totalCount); err != nil {
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
	return &PriceQuotePage{PriceQuotes: quotes, TotalCount: totalCount, Page: page, PageSize: pageSize, TotalPages: totalPages}, nil
}

func priceQuoteOrderBy(sortBy, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "p.Stevilka, p.RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}
	columns := map[string]string{"quoteNumber": "p.Stevilka", "customer": "p.ImePartnerja", "amount": "p.Znesek", "issueDate": "p.DatumIzstavitve", "dueDate": "p.DatumZapadlosti"}
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
