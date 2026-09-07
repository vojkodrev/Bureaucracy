package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
	Products               *ProductRepository
	TaxCodeRepository      *TaxCodeRepository
}

func NewResolver(businessYears *BusinessYearRepository, customers *CustomerRepository, invoices *InvoiceRepository, products *ProductRepository, taxCodes *TaxCodeRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		Customers:              customers,
		Invoices:               invoices,
		Products:               products,
		TaxCodeRepository:      taxCodes,
	}
}
