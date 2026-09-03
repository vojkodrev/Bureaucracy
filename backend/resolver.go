package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
}

func NewResolver(businessYears *BusinessYearRepository, customers *CustomerRepository, invoices *InvoiceRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		Customers:              customers,
		Invoices:               invoices,
	}
}
