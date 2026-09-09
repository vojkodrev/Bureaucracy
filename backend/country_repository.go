package main

import (
	"context"
	"database/sql"
	"fmt"
)

type CountryRepository struct {
	database *sql.DB
}

func NewCountryRepository(database *sql.DB) *CountryRepository {
	return &CountryRepository{database: database}
}

func (repository *CountryRepository) List(ctx context.Context, businessYear string) ([]*Country, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT RecNo, COALESCE(OznakaDrzave, ''), COALESCE(Drzava, '')
		FROM [%s].[dbo].[Drzave]
		WHERE ISNULL(Deleted, 0) = 0
			AND NULLIF(LTRIM(RTRIM(OznakaDrzave)), '') IS NOT NULL
		ORDER BY Drzava, RecNo`, databaseName))
	if err != nil {
		return nil, fmt.Errorf("list countries: %w", err)
	}
	defer rows.Close()

	countries := make([]*Country, 0)
	for rows.Next() {
		country := &Country{}
		if err := rows.Scan(&country.ID, &country.Code, &country.Name); err != nil {
			return nil, fmt.Errorf("scan country: %w", err)
		}
		countries = append(countries, country)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read countries: %w", err)
	}
	return countries, nil
}
