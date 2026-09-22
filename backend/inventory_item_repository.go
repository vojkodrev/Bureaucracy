package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	"bureaucracy/backend/graph/model"
)

type InventoryItemRepository struct {
	database *sql.DB
}

func NewInventoryItemRepository(database *sql.DB) *InventoryItemRepository {
	return &InventoryItemRepository{database: database}
}

func (repository *InventoryItemRepository) GetByCode(ctx context.Context, businessYear string, productCode string) (*InventoryItem, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	productCode = strings.TrimSpace(productCode)
	if productCode == "" {
		return nil, fmt.Errorf("productCode is required")
	}
	item := &InventoryItem{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT RecNo, Artikel, Opis, Enota, MinimalnaZaloga
		FROM [%s].[dbo].[ArtikelNabava]
		WHERE Artikel = @productCode`, fmt.Sprintf("BIRO%s3", businessYear)),
		sql.Named("productCode", productCode),
	).Scan(&item.ID, &item.ProductCode, &item.Name, &item.Unit, &item.MinimumStockLevel)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get inventory item: %w", err)
	}
	return item, nil
}

func (repository *InventoryItemRepository) Save(ctx context.Context, businessYear string, input model.InventoryItemInput) (*InventoryItem, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.ProductCode = strings.TrimSpace(input.ProductCode)
	if input.ProductCode == "" {
		return nil, fmt.Errorf("productCode is required")
	}
	if len([]rune(input.ProductCode)) > 25 {
		return nil, fmt.Errorf("productCode must be at most 25 characters")
	}
	input.Name = trimmedProductString(input.Name)
	input.Unit = trimmedProductString(input.Unit)
	if input.Name == nil {
		return nil, fmt.Errorf("name is required")
	}
	if len([]rune(*input.Name)) > 100 {
		return nil, fmt.Errorf("name must be at most 100 characters")
	}
	if input.Unit != nil && len([]rune(*input.Unit)) > 10 {
		return nil, fmt.Errorf("unit must be at most 10 characters")
	}
	if input.MinimumStockLevel != nil && (*input.MinimumStockLevel < 0 || math.IsNaN(*input.MinimumStockLevel) || math.IsInf(*input.MinimumStockLevel, 0)) {
		return nil, fmt.Errorf("minimumStockLevel must be a non-negative number")
	}
	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	arguments := []any{sql.Named("productCode", input.ProductCode), sql.Named("name", input.Name), sql.Named("unit", input.Unit), sql.Named("minimumStockLevel", input.MinimumStockLevel)}
	if input.ID != nil && *input.ID > 0 {
		arguments = append(arguments, sql.Named("id", *input.ID))
		result, err := repository.database.ExecContext(ctx, fmt.Sprintf(`UPDATE [%s].[dbo].[ArtikelNabava] SET Artikel=@productCode, Opis=@name, Enota=@unit, MinimalnaZaloga=@minimumStockLevel WHERE RecNo=@id`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("update inventory item: %w", err)
		}
		affected, err := result.RowsAffected()
		if err != nil || affected != 1 {
			return nil, fmt.Errorf("inventory item RecNo %d was not found", *input.ID)
		}
	} else {
		_, err := repository.database.ExecContext(ctx, fmt.Sprintf(`INSERT INTO [%s].[dbo].[ArtikelNabava] (Artikel, Opis, Enota, MinimalnaZaloga) VALUES (@productCode, @name, @unit, @minimumStockLevel)`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("insert inventory item: %w", err)
		}
	}
	return repository.GetByCode(ctx, businessYear, input.ProductCode)
}

func (repository *InventoryItemRepository) Search(
	ctx context.Context,
	businessYear string,
	productCode *string,
	productName *string,
	similarName *string,
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
	similaritySearch := normalizedProductName(similarName)
	if similarName != nil && similaritySearch == "" {
		return nil, fmt.Errorf("similarName must contain letters or numbers")
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
	if similaritySearch == "" {
		return repository.searchInventoryItemsNormally(
			ctx, databaseName, arguments, orderBy, page, pageSize,
		)
	}
	return repository.searchInventoryItemsBySimilarity(
		ctx, databaseName, arguments, orderBy, *similarName,
		similarityDistanceLimit(similaritySearch), sortBy != nil, page, pageSize,
	)
}

func (repository *InventoryItemRepository) searchInventoryItemsNormally(
	ctx context.Context,
	databaseName string,
	arguments []any,
	orderBy string,
	page int,
	pageSize int,
) (*InventoryItemPage, error) {
	var totalCount int
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
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

	items, err := scanInventoryItems(rows)
	if err != nil {
		return nil, err
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

func (repository *InventoryItemRepository) searchInventoryItemsBySimilarity(
	ctx context.Context,
	databaseName string,
	arguments []any,
	orderBy string,
	similarName string,
	maximumDistance int,
	hasExplicitSort bool,
	page int,
	pageSize int,
) (*InventoryItemPage, error) {
	arguments = append(arguments,
		sql.Named("similarName", similarName),
		sql.Named("maximumDistance", maximumDistance),
	)
	fromAndFilters := `
		FROM [dbo].[ArtikelNabava]
		CROSS APPLY (VALUES (
			LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
				LTRIM(RTRIM(@similarName)), ' ', ''), '-', ''), '_', ''), '.', ''), '/', ''), '\', '')),
			LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
				LTRIM(RTRIM(Opis)), ' ', ''), '-', ''), '_', ''), '.', ''), '/', ''), '\', ''))
		)) AS Normalized(SearchName, ProductName)
		CROSS APPLY (VALUES (EDIT_DISTANCE(
			Normalized.SearchName, Normalized.ProductName, @maximumDistance + 1
		))) AS Similarity(Distance)
		WHERE (@productCode = '' OR Artikel LIKE @productCode ESCAPE '\')
		  AND (@productName = '' OR Opis LIKE @productName ESCAPE '\')
		  AND Opis IS NOT NULL
		  AND Similarity.Distance <= @maximumDistance`

	var totalCount int
	err := repository.database.QueryRowContext(ctx,
		fmt.Sprintf("USE [%s]; SELECT COUNT(*) %s", databaseName, fromAndFilters),
		arguments...,
	).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count similar inventory items: %w", err)
	}

	resultOrderBy := "Similarity.Distance, Artikel, RecNo"
	if hasExplicitSort {
		resultOrderBy = orderBy
	}
	arguments = append(arguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		USE [%s];
		SELECT RecNo, Artikel, Opis, Enota, MinimalnaZaloga
		%s
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
		databaseName, fromAndFilters, resultOrderBy), arguments...)
	if err != nil {
		return nil, fmt.Errorf("search similar inventory items: %w", err)
	}
	defer rows.Close()

	items, err := scanInventoryItems(rows)
	if err != nil {
		return nil, err
	}
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &InventoryItemPage{Items: items, TotalCount: totalCount, Page: page,
		PageSize: pageSize, TotalPages: totalPages}, nil
}

func scanInventoryItems(rows *sql.Rows) ([]*InventoryItem, error) {
	items := make([]*InventoryItem, 0)
	for rows.Next() {
		item := &InventoryItem{}
		if err := rows.Scan(&item.ID, &item.ProductCode, &item.Name, &item.Unit,
			&item.MinimumStockLevel); err != nil {
			return nil, fmt.Errorf("scan inventory item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read inventory items: %w", err)
	}
	return items, nil
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
