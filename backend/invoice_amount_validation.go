package main

import (
	"fmt"

	"bureaucracy/backend/lib"
)

func validateInvoiceGrossTotal(invoice *Invoice) error {
	itemTotal := int64(0)
	for _, item := range invoice.Items {
		if item != nil {
			itemTotal += lib.CurrencyCents(float64OrZero(item.GrossAmount))
		}
	}
	return validateCalculatedInvoiceGrossTotal(invoice, float64(itemTotal)/100, "line")
}

func validateCalculatedInvoiceGrossTotal(invoice *Invoice, calculatedTotal float64, calculatedTotalName string) error {
	headerTotal := lib.CurrencyCents(float64OrZero(invoice.Amount))
	calculatedTotalCents := lib.CurrencyCents(calculatedTotal)
	if headerTotal != calculatedTotalCents {
		return fmt.Errorf("invoice %s total %.2f does not match %s total %.2f",
			invoice.InvoiceNumber, float64(headerTotal)/100, calculatedTotalName, float64(calculatedTotalCents)/100)
	}
	return nil
}

func validateAccountingExportGrossTotals(rows []AccountingExportRow) error {
	type invoiceTotal struct {
		number string
		header int64
		items  int64
	}
	totals := make(map[string]*invoiceTotal)
	order := make([]string, 0)
	for _, row := range rows {
		number := nullString(row.InvoiceNumber)
		total, exists := totals[number]
		if !exists {
			if !row.InvoiceGross.Valid {
				return fmt.Errorf("invoice %s has no total", number)
			}
			total = &invoiceTotal{number: number, header: lib.CurrencyCents(row.InvoiceGross.Float64)}
			totals[number] = total
			order = append(order, number)
		}
		if row.ItemGross.Valid {
			total.items += lib.CurrencyCents(row.ItemGross.Float64)
		}
	}
	for _, number := range order {
		total := totals[number]
		if total.header != total.items {
			return fmt.Errorf("invoice %s total %.2f does not match line total %.2f",
				total.number, float64(total.header)/100, float64(total.items)/100)
		}
	}
	return nil
}
