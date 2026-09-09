package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	CountryRepository      *CountryRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
	Products               *ProductRepository
	TaxCodeRepository      *TaxCodeRepository
}

func NewResolver(businessYears *BusinessYearRepository, countries *CountryRepository, customers *CustomerRepository, invoices *InvoiceRepository, products *ProductRepository, taxCodes *TaxCodeRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		CountryRepository:      countries,
		Customers:              customers,
		Invoices:               invoices,
		Products:               products,
		TaxCodeRepository:      taxCodes,
	}
}
