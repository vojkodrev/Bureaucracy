package main

//go:generate go tool gqlgen generate

type Resolver struct {
	BusinessYearRepository *BusinessYearRepository
	BankStatements         *BankStatementRepository
	CountryRepository      *CountryRepository
	Customers              *CustomerRepository
	Invoices               *InvoiceRepository
	InventoryItems         *InventoryItemRepository
	GoodsReceipts          *GoodsReceiptRepository
	PriceQuotes            *PriceQuoteRepository
	DeliveryNotes          *DeliveryNoteRepository
	Products               *ProductRepository
	PurchasePredictions    *PurchasePredictionRepository
	Storages               *StorageRepository
	TaxCodeRepository      *TaxCodeRepository
}

func NewResolver(
	businessYears *BusinessYearRepository,
	bankStatements *BankStatementRepository,
	countries *CountryRepository,
	customers *CustomerRepository,
	invoices *InvoiceRepository,
	inventoryItems *InventoryItemRepository,
	goodsReceipts *GoodsReceiptRepository,
	priceQuotes *PriceQuoteRepository,
	deliveryNotes *DeliveryNoteRepository,
	products *ProductRepository,
	purchasePredictions *PurchasePredictionRepository,
	storages *StorageRepository,
	taxCodes *TaxCodeRepository,
) *Resolver {
	return &Resolver{
		BusinessYearRepository: businessYears,
		BankStatements:         bankStatements,
		CountryRepository:      countries,
		Customers:              customers,
		Invoices:               invoices,
		InventoryItems:         inventoryItems,
		GoodsReceipts:          goodsReceipts,
		PriceQuotes:            priceQuotes,
		DeliveryNotes:          deliveryNotes,
		Products:               products,
		PurchasePredictions:    purchasePredictions,
		Storages:               storages,
		TaxCodeRepository:      taxCodes,
	}
}
