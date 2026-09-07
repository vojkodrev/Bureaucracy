package main

import (
	"context"
	"database/sql"
	"fmt"
)

type TaxCodeRepository struct {
	database *sql.DB
}

func NewTaxCodeRepository(database *sql.DB) *TaxCodeRepository {
	return &TaxCodeRepository{database: database}
}

func (repository *TaxCodeRepository) List(ctx context.Context, businessYear string) ([]*TaxCode, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT RecNo, COALESCE(Sifra, ''), Opis, CAST(Procent AS float)
		FROM [%s].[dbo].[PrometniDavek]
		WHERE ISNULL(Deleted, 0) = 0 AND NULLIF(LTRIM(RTRIM(Sifra)), '') IS NOT NULL
		ORDER BY Sifra, RecNo`, databaseName))
	if err != nil {
		return nil, fmt.Errorf("list tax codes: %w", err)
	}
	defer rows.Close()

	taxCodes := make([]*TaxCode, 0)
	for rows.Next() {
		taxCode := &TaxCode{}
		if err := rows.Scan(&taxCode.ID, &taxCode.Code, &taxCode.Description, &taxCode.Rate); err != nil {
			return nil, fmt.Errorf("scan tax code: %w", err)
		}
		taxCodes = append(taxCodes, taxCode)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read tax codes: %w", err)
	}
	return taxCodes, nil
}
