package main

//go:generate go tool gqlgen generate

type Resolver struct {
	Invoices *InvoiceRepository
}

func NewResolver(invoices *InvoiceRepository) *Resolver {
	return &Resolver{Invoices: invoices}
}
