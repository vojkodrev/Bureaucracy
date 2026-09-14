package main

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"net/mail"
	"strings"

	"bureaucracy/backend/graph/model"
)

type CustomerRepository struct {
	database *sql.DB
}

func (repository *CustomerRepository) UpdateEmail(
	ctx context.Context,
	businessYear string,
	customerID string,
	email string,
) (*Customer, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	customerID = strings.TrimSpace(customerID)
	if customerID == "" {
		return nil, fmt.Errorf("customerId is required")
	}
	email = strings.TrimSpace(email)
	address, err := mail.ParseAddress(email)
	if err != nil || !strings.EqualFold(address.Address, email) {
		return nil, fmt.Errorf("email must be a valid email address")
	}
	if len([]rune(email)) > 50 {
		return nil, fmt.Errorf("email must be at most 50 characters")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	result, err := repository.database.ExecContext(ctx, fmt.Sprintf(`
		UPDATE [%s].[dbo].[Partner]
		SET Email = @email
		WHERE Sifra = @customerID`, databaseName),
		sql.Named("email", email),
		sql.Named("customerID", customerID),
	)
	if err != nil {
		return nil, fmt.Errorf("update customer email: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("check updated customer email: %w", err)
	}
	if rowsAffected == 0 {
		return nil, fmt.Errorf("customer not found")
	}
	return repository.GetByID(ctx, businessYear, customerID)
}

func NewCustomerRepository(database *sql.DB) *CustomerRepository {
	return &CustomerRepository{database: database}
}

func (repository *CustomerRepository) GetByID(ctx context.Context, businessYear string, customerID string) (*Customer, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	customerID = strings.TrimSpace(customerID)
	if customerID == "" {
		return nil, fmt.Errorf("customerId is required")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	customer := &Customer{}
	err := repository.database.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT RecNo, Sifra, Partner, Ulica, Posta, Kraj, Drzava, Kontakt,
			Email, Telefon, IDStevilka, MaticnaStevilka, PlacilniRok, RabatGeneralno
		FROM [%s].[dbo].[Partner]
		WHERE Sifra = @customerID`, databaseName),
		sql.Named("customerID", customerID),
	).Scan(
		&customer.ID, &customer.CustomerID, &customer.Name, &customer.Address,
		&customer.PostalCode, &customer.City, &customer.Country, &customer.Contact,
		&customer.Email, &customer.Phone, &customer.TaxNumber,
		&customer.RegistrationNumber, &customer.PaymentTerm, &customer.Discount,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get customer: %w", err)
	}
	return customer, nil
}

func (repository *CustomerRepository) Save(ctx context.Context, businessYear string, input model.CustomerInput) (*Customer, error) {
	if !businessYearPattern.MatchString(businessYear) {
		return nil, fmt.Errorf("businessYear must contain only digits")
	}
	input.CustomerID = strings.TrimSpace(input.CustomerID)
	if input.CustomerID == "" {
		return nil, fmt.Errorf("customerId is required")
	}
	if len([]rune(input.CustomerID)) > 10 {
		return nil, fmt.Errorf("customerId must be at most 10 characters")
	}

	input.Name = trimmedCustomerString(input.Name)
	input.Address = trimmedCustomerString(input.Address)
	input.PostalCode = trimmedCustomerString(input.PostalCode)
	input.City = trimmedCustomerString(input.City)
	input.Country = trimmedCustomerString(input.Country)
	input.Contact = trimmedCustomerString(input.Contact)
	input.Email = trimmedCustomerString(input.Email)
	input.Phone = trimmedCustomerString(input.Phone)
	input.TaxNumber = trimmedCustomerString(input.TaxNumber)
	input.RegistrationNumber = trimmedCustomerString(input.RegistrationNumber)
	if input.Name == nil {
		return nil, fmt.Errorf("name is required")
	}
	for name, field := range map[string]struct {
		value *string
		limit int
	}{
		"name": {input.Name, 52}, "address": {input.Address, 32},
		"postalCode": {input.PostalCode, 10}, "city": {input.City, 50},
		"country": {input.Country, 3}, "contact": {input.Contact, 60},
		"email": {input.Email, 50}, "phone": {input.Phone, 60},
		"taxNumber": {input.TaxNumber, 22}, "registrationNumber": {input.RegistrationNumber, 10},
	} {
		if field.value != nil && len([]rune(*field.value)) > field.limit {
			return nil, fmt.Errorf("%s must be at most %d characters", name, field.limit)
		}
	}
	if input.PaymentTerm != nil && (*input.PaymentTerm < 0 || *input.PaymentTerm > math.MaxInt16) {
		return nil, fmt.Errorf("paymentTerm must be between 0 and %d", math.MaxInt16)
	}
	if input.Discount != nil && (*input.Discount < 0 || *input.Discount > 100 || math.IsNaN(*input.Discount) || math.IsInf(*input.Discount, 0)) {
		return nil, fmt.Errorf("discount must be between 0 and 100")
	}

	databaseName := fmt.Sprintf("BIRO%s3", businessYear)
	arguments := []any{
		sql.Named("customerID", input.CustomerID), sql.Named("name", input.Name),
		sql.Named("address", input.Address), sql.Named("postalCode", input.PostalCode),
		sql.Named("city", input.City), sql.Named("country", input.Country),
		sql.Named("contact", input.Contact), sql.Named("email", input.Email),
		sql.Named("phone", input.Phone), sql.Named("taxNumber", input.TaxNumber),
		sql.Named("registrationNumber", input.RegistrationNumber),
		sql.Named("paymentTerm", input.PaymentTerm), sql.Named("discount", input.Discount),
	}
	if input.ID != nil && *input.ID > 0 {
		arguments = append(arguments, sql.Named("id", *input.ID))
		result, err := repository.database.ExecContext(ctx, fmt.Sprintf(`
			UPDATE [%s].[dbo].[Partner]
			SET Sifra=@customerID, Partner=@name, Ulica=@address, Posta=@postalCode,
				Kraj=@city, Drzava=@country, Kontakt=@contact, Email=@email,
				Telefon=@phone, IDStevilka=@taxNumber,
				MaticnaStevilka=@registrationNumber, PlacilniRok=@paymentTerm,
				RabatGeneralno=@discount
			WHERE RecNo=@id`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("update customer: %w", err)
		}
		affected, err := result.RowsAffected()
		if err != nil || affected != 1 {
			return nil, fmt.Errorf("customer RecNo %d was not found", *input.ID)
		}
	} else {
		_, err := repository.database.ExecContext(ctx, fmt.Sprintf(`
			INSERT INTO [%s].[dbo].[Partner] (
				Sifra, Partner, Ulica, Posta, Kraj, Drzava, Kontakt, Email,
				Telefon, IDStevilka, MaticnaStevilka, PlacilniRok, RabatGeneralno
			) VALUES (
				@customerID, @name, @address, @postalCode, @city, @country,
				@contact, @email, @phone, @taxNumber, @registrationNumber,
				@paymentTerm, @discount
			)`, databaseName), arguments...)
		if err != nil {
			return nil, fmt.Errorf("insert customer: %w", err)
		}
	}
	return repository.GetByID(ctx, businessYear, input.CustomerID)
}

func trimmedCustomerString(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
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
			IDStevilka,
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
		"taxNumber":  "IDStevilka",
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
