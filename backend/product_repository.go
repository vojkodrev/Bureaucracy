package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"strings"

	"bureaucracy/backend/graph/model"
)

type ProductRepository struct {
	database *sql.DB
}

func (repository *ProductRepository) GetByCode(ctx context.Context, businessYear string, productCode string) (*Product, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	productCode = strings.TrimSpace(productCode)
	if productCode == "" {
		return nil, fmt.Errorf("productCode is required")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	product := &Product{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT RecNo, Artikel, Opis, BarKoda, Enota, CenaBrezDavka,
			CenaZDavkom, CAST(Davek AS float), SifraDavka
		FROM [%s].[dbo].[Artikel]
		WHERE Artikel = @productCode`, databaseName),
		sql.Named("productCode", productCode),
	).Scan(
		&product.ID,
		&product.ProductCode,
		&product.Name,
		&product.Barcode,
		&product.Unit,
		&product.NetPrice,
		&product.GrossPrice,
		&product.TaxRate,
		&product.TaxCode,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get product: %w", err)
	}
	return product, nil
}

func (repository *ProductRepository) Save(ctx context.Context, businessYear string, input model.ProductInput) (*Product, error) {
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
	input.TaxCode = trimmedProductString(input.TaxCode)
	if input.Name == nil {
		return nil, fmt.Errorf("name is required")
	}
	if len([]rune(*input.Name)) > 100 {
		return nil, fmt.Errorf("name must be at most 100 characters")
	}
	if input.Unit != nil && len([]rune(*input.Unit)) > 10 {
		return nil, fmt.Errorf("unit must be at most 10 characters")
	}
	if input.TaxCode != nil && len([]rune(*input.TaxCode)) > 2 {
		return nil, fmt.Errorf("taxCode must be at most 2 characters")
	}
	for name, value := range map[string]*float64{
		"netPrice": input.NetPrice, "grossPrice": input.GrossPrice, "taxRate": input.TaxRate,
	} {
		if value != nil && (*value < 0 || math.IsNaN(*value) || math.IsInf(*value, 0)) {
			return nil, fmt.Errorf("%s must be a non-negative number", name)
		}
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	arguments := []any{
		sql.Named("productCode", input.ProductCode),
		sql.Named("name", input.Name),
		sql.Named("unit", input.Unit),
		sql.Named("netPrice", input.NetPrice),
		sql.Named("grossPrice", input.GrossPrice),
		sql.Named("taxRate", input.TaxRate),
		sql.Named("taxCode", input.TaxCode),
	}

	if input.ID != nil && *input.ID > 0 {
		arguments = append(arguments, sql.Named("id", *input.ID))
		result, err := repository.database.ExecContext(ctx, fmt.Sprintf(`
			UPDATE [%s].[dbo].[Artikel]
			SET Artikel=@productCode, Opis=@name, Enota=@unit,
				CenaBrezDavka=@netPrice, CenaZDavkom=@grossPrice,
				Davek=@taxRate, SifraDavka=@taxCode
			WHERE RecNo=@id`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("update product: %w", err)
		}
		affected, err := result.RowsAffected()
		if err != nil || affected != 1 {
			return nil, fmt.Errorf("product RecNo %d was not found", *input.ID)
		}
	} else {
		_, err := repository.database.ExecContext(ctx, fmt.Sprintf(`
			INSERT INTO [%s].[dbo].[Artikel] (
				Artikel, Opis, Enota, CenaBrezDavka,
				CenaZDavkom, Davek, SifraDavka
			) VALUES (
				@productCode, @name, @unit, @netPrice,
				@grossPrice, @taxRate, @taxCode
			)`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("insert product: %w", err)
		}
	}

	return repository.GetByCode(ctx, businessYear, input.ProductCode)
}

func trimmedProductString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func NewProductRepository(database *sql.DB) *ProductRepository {
	return &ProductRepository{database: database}
}

func (repository *ProductRepository) Search(
	ctx context.Context,
	businessYear string,
	productCode *string,
	productName *string,
	sortBy *string,
	sortDirection *string,
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
	orderBy, err := productOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	queryArguments := []any{
		sql.Named("productCode", optionalLikePattern(productCode)),
		sql.Named("productName", optionalLikePattern(productName)),
	}

	var totalCount int
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
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
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, orderBy),
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

func productOrderBy(sortBy *string, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "Artikel, RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}

	columns := map[string]string{
		"productCode": "Artikel",
		"name":        "Opis",
		"barcode":     "BarKoda",
		"unit":        "Enota",
		"netPrice":    "CenaBrezDavka",
		"grossPrice":  "CenaZDavkom",
		"taxRate":     "Davek",
		"taxCode":     "SifraDavka",
	}
	column, ok := columns[*sortBy]
	if !ok {
		return "", fmt.Errorf("invalid product sort column %q", *sortBy)
	}
	direction := strings.ToUpper(*sortDirection)
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return column + " " + direction + ", RecNo " + direction, nil
}
