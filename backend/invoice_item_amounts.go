package main

type invoiceItemAmounts struct {
	Quantity            float64
	UnitPrice           float64
	OriginalNetAmount   float64
	NetAmount           float64
	GrossAmount         float64
	Discount            float64
	DiscountAmount      float64
	DiscountedUnitPrice float64
	TaxRate             float64
}

func calculateInvoiceItemAmounts(item *InvoiceItem) invoiceItemAmounts {
	quantity := float64OrZero(item.Quantity)
	unitPrice := float64OrZero(item.UnitPrice)
	netAmount := float64OrZero(item.NetAmount)

	return invoiceItemAmounts{
		Quantity:            quantity,
		UnitPrice:           unitPrice,
		OriginalNetAmount:   unitPrice * quantity,
		NetAmount:           netAmount,
		GrossAmount:         float64OrZero(item.GrossAmount),
		Discount:            float64OrZero(item.Discount),
		DiscountAmount:      unitPrice*quantity - netAmount,
		DiscountedUnitPrice: divide(netAmount, quantity),
		TaxRate:             float64OrZero(item.TaxRate),
	}
}
