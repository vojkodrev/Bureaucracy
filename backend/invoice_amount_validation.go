package main

import (
	"fmt"

	"bureaucracy/backend/lib"
)

func validateInvoiceGrossTotal(invoice *Invoice) error {
	itemTotal := 0.0
	for _, item := range invoice.Items {
		if item != nil {
			itemTotal += lib.RoundCurrency(float64OrZero(item.GrossAmount))
		}
	}
	itemTotal = lib.RoundCurrency(itemTotal)
	return validateCalculatedInvoiceGrossTotal(invoice, itemTotal, "line")
}

func validateCalculatedInvoiceGrossTotal(invoice *Invoice, calculatedTotal float64, calculatedTotalName string) error {
	headerTotal := lib.RoundCurrency(float64OrZero(invoice.Amount))
	calculatedTotal = lib.RoundCurrency(calculatedTotal)
	if headerTotal != calculatedTotal {
		return fmt.Errorf("invoice %s total %.2f does not match %s total %.2f",
			invoice.InvoiceNumber, headerTotal, calculatedTotalName, calculatedTotal)
	}
	return nil
}

func validateAccountingExportGrossTotals(rows []AccountingExportRow) error {
	type invoiceTotal struct {
		number string
		header float64
		items  float64
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
			total = &invoiceTotal{number: number, header: lib.RoundCurrency(row.InvoiceGross.Float64)}
			totals[number] = total
			order = append(order, number)
		}
		if row.ItemGross.Valid {
			total.items += lib.RoundCurrency(row.ItemGross.Float64)
		}
	}
	for _, number := range order {
		total := totals[number]
		itemTotal := lib.RoundCurrency(total.items)
		if total.header != itemTotal {
			return fmt.Errorf("invoice %s total %.2f does not match line total %.2f",
				total.number, total.header, itemTotal)
		}
	}
	return nil
}
