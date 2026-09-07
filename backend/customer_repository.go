package main

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type CustomerRepository struct {
	database *sql.DB
}

func NewCustomerRepository(database *sql.DB) *CustomerRepository {
	return &CustomerRepository{database: database}
}

func (repository *CustomerRepository) Search(
	ctx context.Context,
	businessYear string,
	customerID *string,
	customerName *string,
	sortBy *string,
	sortDirection *string,
	page int,
	pageSize int,
) (*CustomerPage, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	if page < 1 {
		return nil, fmt.Errorf("page must be at least 1")
	}
	if pageSize < 1 || pageSize > 100 {
		return nil, fmt.Errorf("pageSize must be between 1 and 100")
	}
	orderBy, err := customerOrderBy(sortBy, sortDirection)
	if err != nil {
		return nil, err
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	queryArguments := []any{
		sql.Named("customerID", optionalLikePattern(customerID)),
		sql.Named("customerName", optionalLikePattern(customerName)),
	}

	var totalCount int
	err = repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT COUNT(*)
		FROM [%s].[dbo].[Partner]
		WHERE (@customerID = '' OR Sifra LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR Partner LIKE @customerName ESCAPE '\')`, databaseName),
		queryArguments...,
	).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count customers: %w", err)
	}

	queryArguments = append(queryArguments,
		sql.Named("offset", (page-1)*pageSize),
		sql.Named("pageSize", pageSize),
	)
	rows, err := repository.database.QueryContext(ctx, fmt.Sprintf(`
		SELECT
			RecNo,
			Sifra,
			Partner,
			Ulica,
			Posta,
			Kraj,
			Drzava,
			Kontakt,
			Email,
			Telefon,
			DavcnaStevilka,
			MaticnaStevilka,
			PlacilniRok,
			RabatGeneralno
		FROM [%s].[dbo].[Partner]
		WHERE (@customerID = '' OR Sifra LIKE @customerID ESCAPE '\')
		  AND (@customerName = '' OR Partner LIKE @customerName ESCAPE '\')
		ORDER BY %s
		OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`, databaseName, orderBy),
		queryArguments...,
	)
	if err != nil {
		return nil, fmt.Errorf("search customers: %w", err)
	}
	defer rows.Close()

	customers := make([]*Customer, 0)
	for rows.Next() {
		customer := &Customer{}
		if err := rows.Scan(
			&customer.ID,
			&customer.CustomerID,
			&customer.Name,
			&customer.Address,
			&customer.PostalCode,
			&customer.City,
			&customer.Country,
			&customer.Contact,
			&customer.Email,
			&customer.Phone,
			&customer.TaxNumber,
			&customer.RegistrationNumber,
			&customer.PaymentTerm,
			&customer.Discount,
		); err != nil {
			return nil, fmt.Errorf("scan customer: %w", err)
		}
		customers = append(customers, customer)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read customers: %w", err)
	}

	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + pageSize - 1) / pageSize
	}
	return &CustomerPage{
		Customers:  customers,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func customerOrderBy(sortBy *string, sortDirection *string) (string, error) {
	if sortBy == nil && sortDirection == nil {
		return "Sifra, RecNo", nil
	}
	if sortBy == nil || sortDirection == nil {
		return "", fmt.Errorf("sortBy and sortDirection must be provided together")
	}

	columns := map[string]string{
		"customerId": "Sifra",
		"name":       "Partner",
		"address":    "Ulica",
		"city":       "Kraj",
		"contact":    "Kontakt",
		"email":      "Email",
		"phone":      "Telefon",
		"taxNumber":  "DavcnaStevilka",
	}
	column, ok := columns[*sortBy]
	if !ok {
		return "", fmt.Errorf("invalid customer sort column %q", *sortBy)
	}
	direction := strings.ToUpper(*sortDirection)
	if direction != "ASC" && direction != "DESC" {
		return "", fmt.Errorf("sortDirection must be asc or desc")
	}
	return column + " " + direction + ", RecNo " + direction, nil
}
