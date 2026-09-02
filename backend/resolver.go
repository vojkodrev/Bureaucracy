package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	Invoices               *InvoiceRepository
}

func NewResolver(businessYears *BusinessYearRepository, invoices *InvoiceRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		Invoices:               invoices,
	}
}
