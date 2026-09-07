package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type BusinessYearRepository struct {
	database *sql.DB
}

func NewBusinessYearRepository(database *sql.DB) *BusinessYearRepository {
	return &BusinessYearRepository{database: database}
}

func (repository *BusinessYearRepository) GetByCode(
	ctx context.Context,
	code string,
) (*BusinessYear, error) {
	code = strings.TrimSpace(code)
	if code == "" {
		return nil, fmt.Errorf("business year code is required")
	}

	businessYear := &BusinessYear{}
	err := repository.database.QueryRowContext(ctx, `
		SELECT
			Oznaka,
			Opis,
			LetoPoslovanja,
			IzhajaIz
		FROM [Birokrat].[dbo].[PoslovnaLeta]
		WHERE Oznaka = @code`,
		sql.Named("code", code),
	).Scan(
		&businessYear.Code,
		&businessYear.Description,
		&businessYear.Year,
		&businessYear.DerivedFrom,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get business year: %w", err)
	}
	return businessYear, nil
}

func (repository *BusinessYearRepository) List(
	ctx context.Context,
	page int,
	pageSize int,
) (*BusinessYearPage, error) {
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 100 {
		return nil, fmt.Errorf("pageSize must be between 1 and 100")
	}

	var totalCount int
	if err := repository.database.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM [Birokrat].[dbo].[PoslovnaLeta]`).Scan(&totalCount); err != nil {
		return nil, fmt.Errorf("count business years: %w", err)
	}

	rows, err := repository.database.QueryContext(ctx, `
		SELECT
			Oznaka,
			Opis,
			LetoPoslovanja,
			IzhajaIz
		FROM [Birokrat].[dbo].[PoslovnaLeta]
		ORDER BY Oznaka
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	if err != nil {
		return nil, fmt.Errorf("list business years: %w", err)
	}
	defer rows.Close()

	businessYears := make([]*BusinessYear, 0)
	for rows.Next() {
		businessYear := &BusinessYear{}
		if err := rows.Scan(
			&businessYear.Code,
			&businessYear.Description,
			&businessYear.Year,
			&businessYear.DerivedFrom,
		); err != nil {
			return nil, fmt.Errorf("scan business year: %w", err)
		}
		businessYears = append(businessYears, businessYear)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read business years: %w", err)
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}

	return &BusinessYearPage{
		BusinessYears: businessYears,
		TotalCount:    totalCount,
		Page:          page,
		PageSize:      pageSize,
		TotalPages:    totalPages,
	}, nil
}
