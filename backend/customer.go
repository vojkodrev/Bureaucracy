package main

type Customer struct {
	ID                 int      `json:"id"`
	CustomerID         *string  `json:"customerId"`
	Name               *string  `json:"name"`
	Address            *string  `json:"address"`
	PostalCode         *string  `json:"postalCode"`
	City               *string  `json:"city"`
	Country            *string  `json:"country"`
	Contact            *string  `json:"contact"`
	Email              *string  `json:"email"`
	Phone              *string  `json:"phone"`
	TaxNumber          *string  `json:"taxNumber"`
	RegistrationNumber *string  `json:"registrationNumber"`
	PaymentTerm        *int     `json:"paymentTerm"`
	Discount           *float64 `json:"discount"`
	Disabled           *bool    `json:"disabled"`
}

type CustomerPage struct {
	Customers  []*Customer `json:"customers"`
	TotalCount int         `json:"totalCount"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalPages int         `json:"totalPages"`
}
