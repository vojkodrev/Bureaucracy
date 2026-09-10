package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	BankStatements         *BankStatementRepository
	CountryRepository      *CountryRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
	Products               *ProductRepository
	TaxCodeRepository      *TaxCodeRepository
}

func NewResolver(businessYears *BusinessYearRepository, bankStatements *BankStatementRepository, countries *CountryRepository, customers *CustomerRepository, invoices *InvoiceRepository, products *ProductRepository, taxCodes *TaxCodeRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		BankStatements:         bankStatements,
		CountryRepository:      countries,
		Customers:              customers,
		Invoices:               invoices,
		Products:               products,
		TaxCodeRepository:      taxCodes,
	}
}
