package main

import "time"

func summarizeInvoicesByCustomer(invoicePage *InvoicePage, now time.Time) *InvoiceCustomerSummaryPage {
	summaryPage := &InvoiceCustomerSummaryPage{
		CustomerSummaries: make([]*InvoiceCustomerSummary, 0),
		TotalCount:        invoicePage.TotalCount,
		Page:              invoicePage.Page,
		PageSize:          invoicePage.PageSize,
		TotalPages:        invoicePage.TotalPages,
	}

	for _, invoice := range invoicePage.Invoices {
		if invoice == nil {
			continue
		}
		var summary *InvoiceCustomerSummary
		if len(summaryPage.CustomerSummaries) > 0 {
			candidate := summaryPage.CustomerSummaries[len(summaryPage.CustomerSummaries)-1]
			if optionalStringEqual(candidate.CustomerCode, invoice.CustomerCode) &&
				optionalStringEqual(candidate.CustomerName, invoice.CustomerName) {
				summary = candidate
			}
		}
		if summary == nil {
			summary = &InvoiceCustomerSummary{
				CustomerCode: invoice.CustomerCode,
				CustomerName: invoice.CustomerName,
				Invoices:     make([]*Invoice, 0),
			}
			summaryPage.CustomerSummaries = append(summaryPage.CustomerSummaries, summary)
		}

		summary.Invoices = append(summary.Invoices, invoice)
		amount := float64OrZero(invoice.Amount)
		summary.TotalInvoiced += amount
		if invoice.PaymentDate != nil {
			summary.TotalPaid += amount
		} else {
			summary.TotalOutstanding += amount
			if invoice.DueDate != nil && invoice.DueDate.Before(now) {
				summary.TotalOverdue += amount
			}
		}
	}

	return summaryPage
}

func optionalStringEqual(left *string, right *string) bool {
	return stringOrEmpty(left) == stringOrEmpty(right)
}

func stringOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
