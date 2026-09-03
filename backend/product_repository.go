package main

import (
	"context"
	"database/sql"
	"fmt"
)

type ProductRepository struct {
	database *sql.DB
}

func NewProductRepository(database *sql.DB) *ProductRepository {
	return &ProductRepository{database: database}
}

func (repository *ProductRepository) Search(
	ctx context.Context,
	businessYear string,
	productCode *string,
	productName *string,
	page int,
	pageSize int,
) (*ProductPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 100 {
		return nil, fmt.Errorf("pageSize must be between 1 and 100")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	queryArguments := []any{
		sql.Named("productCode", optionalLikePattern(productCode)),
		sql.Named("productName", optionalLikePattern(productName)),
	}

	var totalCount int
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[Artikel]
		WHERE (@productCode = '' OR Artikel LIKE @productCode ESCAPE '\')
		  AND (@productName = '' OR Opis LIKE @productName ESCAPE '\')`, databaseName),
		queryArguments...,
	).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count products: %w", err)
	}

	queryArguments = append(queryArguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT
			RecNo,
			Artikel,
			Opis,
			BarKoda,
			Enota,
			CenaBrezDavka,
			CenaZDavkom,
			CAST(Davek AS float),
			SifraDavka
		FROM [%s].[dbo].[Artikel]
		WHERE (@productCode = '' OR Artikel LIKE @productCode ESCAPE '\')
		  AND (@productName = '' OR Opis LIKE @productName ESCAPE '\')
		ORDER BY Artikel
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName),
		queryArguments...,
	)
	if err != nil {
		return nil, fmt.Errorf("search products: %w", err)
	}
	defer rows.Close()

	products := make([]*Product, 0)
	for rows.Next() {
		product := &Product{}
		if err := rows.Scan(
			&product.ID,
			&product.ProductCode,
			&product.Name,
			&product.Barcode,
			&product.Unit,
			&product.NetPrice,
			&product.GrossPrice,
			&product.TaxRate,
			&product.TaxCode,
		); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read products: %w", err)
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &ProductPage{
		Products:   products,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}
