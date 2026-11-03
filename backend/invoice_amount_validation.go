package main

import (
	"fmt"

	"bureaucracy/backend/lib"
)

type calculatedInvoiceTotals struct {
	net   int64
	vat   int64
	gross int64
}

func validateInvoiceGrossTotal(invoice *Invoice) error {
	itemTotal := int64(0)
	for index, item := range invoice.Items {
		if item != nil {
			if err := validateInvoiceItemGrossTotal(invoice.InvoiceNumber, index+1,
				float64OrZero(item.NetAmount), float64OrZero(item.GrossAmount), float64OrZero(item.TaxRate)); err != nil {
				return err
			}
			itemTotal += lib.CurrencyCents(float64OrZero(item.GrossAmount))
		}
	}
	return validateCalculatedInvoiceGrossTotal(invoice, float64(itemTotal)/100, "line")
}

func validateInvoiceItemGrossTotal(invoiceNumber string, lineNumber int, netAmount, grossAmount, taxRate float64) error {
	netTotal := lib.CurrencyCents(netAmount)
	vatTotal := lib.CurrencyCents(netAmount * taxRate / 100)
	grossTotal := lib.CurrencyCents(grossAmount)
	if grossTotal != netTotal+vatTotal {
		return fmt.Errorf("invoice %s line %d gross total %.2f does not match net total %.2f plus VAT %.2f",
			invoiceNumber, lineNumber, float64(grossTotal)/100, float64(netTotal)/100, float64(vatTotal)/100)
	}
	return nil
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

func validateCalculatedInvoiceTotals(invoice *Invoice, netTotal, taxTotal, grossTotal float64, calculated calculatedInvoiceTotals) error {
	inputNetTotal := lib.CurrencyCents(float64OrZero(invoice.GoodsAmount))
	printNetTotal := lib.CurrencyCents(netTotal)
	if inputNetTotal != printNetTotal {
		return fmt.Errorf("invoice %s input net total %.2f does not match print net total %.2f",
			invoice.InvoiceNumber, float64(inputNetTotal)/100, float64(printNetTotal)/100)
	}
	inputGrossTotal := lib.CurrencyCents(float64OrZero(invoice.Amount))
	printGrossTotal := lib.CurrencyCents(grossTotal)
	if inputGrossTotal != printGrossTotal {
		return fmt.Errorf("invoice %s input gross total %.2f does not match print gross total %.2f",
			invoice.InvoiceNumber, float64(inputGrossTotal)/100, float64(printGrossTotal)/100)
	}
	if printNetTotal != calculated.net {
		return fmt.Errorf("invoice %s print net total %.2f does not match calculated line net total %.2f",
			invoice.InvoiceNumber, float64(printNetTotal)/100, float64(calculated.net)/100)
	}
	if printGrossTotal != calculated.gross {
		return fmt.Errorf("invoice %s print gross total %.2f does not match calculated line gross total %.2f",
			invoice.InvoiceNumber, float64(printGrossTotal)/100, float64(calculated.gross)/100)
	}
	printTaxTotal := lib.CurrencyCents(taxTotal)
	if printTaxTotal != calculated.vat {
		return fmt.Errorf("invoice %s print VAT total %.2f does not match calculated line VAT total %.2f",
			invoice.InvoiceNumber, float64(printTaxTotal)/100, float64(calculated.vat)/100)
	}
	if printGrossTotal != printNetTotal+printTaxTotal {
		return fmt.Errorf("invoice %s print gross total %.2f does not match net total %.2f plus VAT %.2f",
			invoice.InvoiceNumber, float64(printGrossTotal)/100, float64(printNetTotal)/100, float64(printTaxTotal)/100)
	}
	if calculated.gross != calculated.net+calculated.vat {
		return fmt.Errorf("invoice %s calculated print gross total %.2f does not match net total %.2f plus VAT %.2f",
			invoice.InvoiceNumber, float64(calculated.gross)/100, float64(calculated.net)/100, float64(calculated.vat)/100)
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
			if row.ItemNet.Valid && row.ItemTaxRate.Valid {
				if err := validateInvoiceItemGrossTotal(number, int(row.ItemSequence.Int64),
					row.ItemNet.Float64, row.ItemGross.Float64, row.ItemTaxRate.Float64); err != nil {
					return err
				}
			}
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
