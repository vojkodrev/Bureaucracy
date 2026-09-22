package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	BankStatements         *BankStatementRepository
	CountryRepository      *CountryRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
	InventoryItems         *InventoryItemRepository
	PriceQuotes            *PriceQuoteRepository
	Products               *ProductRepository
	TaxCodeRepository      *TaxCodeRepository
}

func NewResolver(businessYears *BusinessYearRepository, bankStatements *BankStatementRepository, countries *CountryRepository, customers *CustomerRepository, invoices *InvoiceRepository, inventoryItems *InventoryItemRepository, priceQuotes *PriceQuoteRepository, products *ProductRepository, taxCodes *TaxCodeRepository) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		BankStatements:         bankStatements,
		CountryRepository:      countries,
		Customers:              customers,
		Invoices:               invoices,
		InventoryItems:         inventoryItems,
		PriceQuotes:            priceQuotes,
		Products:               products,
		TaxCodeRepository:      taxCodes,
	}
}
