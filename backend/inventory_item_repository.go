package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type InventoryItemRepository struct {
	database *sql.DB
}

func NewInventoryItemRepository(database *sql.DB) *InventoryItemRepository {
	return &InventoryItemRepository{database: database}
}

func (repository *InventoryItemRepository) Search(
	ctx context.Context,
	businessYear string,
	productCode *string,
	productName *string,
	sortBy *string,
	sortDirection *string,
	page int,
	pageSize int,
) (*InventoryItemPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 10000 {
		return nil, fmt.Errorf("pageSize must be between 1 and 10000")
	}
	orderBy, err := inventoryItemOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	arguments := []any{
		sql.Named("productCode", optionalLikePattern(productCode)),
		sql.Named("productName", optionalLikePattern(productName)),
	}
	var totalCount int
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[ArtikelNabava]
		WHERE (@productCode = '' OR Artikel LIKE @productCode ESCAPE '\')
		  AND (@productName = '' OR Opis LIKE @productName ESCAPE '\')`, databaseName),
		arguments...,
	).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count inventory items: %w", err)
	}

	arguments = append(arguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT RecNo, Artikel, Opis, Enota, MinimalnaZaloga
		FROM [%s].[dbo].[ArtikelNabava]
		WHERE (@productCode = '' OR Artikel LIKE @productCode ESCAPE '\')
		  AND (@productName = '' OR Opis LIKE @productName ESCAPE '\')
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, orderBy),
		arguments...,
	)
	if err != nil {
		return nil, fmt.Errorf("search inventory items: %w", err)
	}
	defer rows.Close()

	items := make([]*InventoryItem, 0)
	for rows.Next() {
		item := &InventoryItem{}
		if err := rows.Scan(
			&item.ID,
			&item.ProductCode,
			&item.Name,
			&item.Unit,
			&item.MinimumStockLevel,
		); err != nil {
			return nil, fmt.Errorf("scan inventory item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read inventory items: %w", err)
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &InventoryItemPage{
		Items: items, TotalCount: totalCount, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func inventoryItemOrderBy(sortBy *string, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "Artikel, RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}

	columns := map[string]string{
		"productCode":       "Artikel",
		"name":              "Opis",
		"unit":              "Enota",
		"minimumStockLevel": "MinimalnaZaloga",
	}
	column, ok := columns[*sortBy]
	if !ok {
		return "", fmt.Errorf("invalid inventory item sort column %q", *sortBy)
	}
	direction := strings.ToUpper(*sortDirection)
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return column + " " + direction + ", RecNo " + direction, nil
}
