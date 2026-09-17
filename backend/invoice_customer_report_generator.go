package main

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"
	"strings"
	"time"
)

type invoiceCustomerReportDocument struct {
	Title        string
	BusinessYear int
	DateRange    string
	GeneratedAt  string
	ResultPage   string
	Customers    []invoiceCustomerReportSection
}

type invoiceCustomerReportSection struct {
	Customer         string
	Invoices         []invoiceReportRow
	TotalPaid        string
	TotalOutstanding string
	TotalOverdue     string
	TotalInvoiced    string
}

//go:embed print/invoice-customer-report/template.html
var invoiceCustomerReportHTMLTemplate string

//go:embed print/invoice-customer-report/template.css
var invoiceCustomerReportCSSTemplate string

type InvoiceCustomerReportGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewInvoiceCustomerReportGenerator(pdfRenderer *HTMLPDFRenderer) (*InvoiceCustomerReportGenerator, error) {
	tmpl, err := template.New("invoice-customer-report").Parse(invoiceCustomerReportHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice customer report print template: %w", err)
	}
	return &InvoiceCustomerReportGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *InvoiceCustomerReportGenerator) Generate(
	ctx context.Context,
	summaryPage *InvoiceCustomerSummaryPage,
	businessYear int,
	issuedFrom *time.Time,
	issuedTo *time.Time,
) ([]byte, error) {
	if summaryPage == nil {
		return nil, fmt.Errorf("invoice customer summary page is required")
	}

	customers := make([]invoiceCustomerReportSection, 0, len(summaryPage.CustomerSummaries))
	for _, summary := range summaryPage.CustomerSummaries {
		if summary == nil {
			continue
		}
		rows := make([]invoiceReportRow, 0, len(summary.Invoices))
		for _, invoice := range summary.Invoices {
			if invoice == nil {
				continue
			}
			rows = append(rows, invoiceReportRow{
				InvoiceNumber: invoice.InvoiceNumber,
				Amount:        formatMoneyAmount(float64OrZero(invoice.Amount)),
				IssueDate:     formatDocumentDate(invoice.IssueDate),
				DueDate:       formatDocumentDate(invoice.DueDate),
				PaymentDate:   formatDocumentDate(invoice.PaymentDate),
			})
		}
		customers = append(customers, invoiceCustomerReportSection{
			Customer:         invoiceCustomerReportName(summary.CustomerCode, summary.CustomerName),
			Invoices:         rows,
			TotalPaid:        formatMoneyAmount(summary.TotalPaid),
			TotalOutstanding: formatMoneyAmount(summary.TotalOutstanding),
			TotalOverdue:     formatMoneyAmount(summary.TotalOverdue),
			TotalInvoiced:    formatMoneyAmount(summary.TotalInvoiced),
		})
	}

	document := invoiceCustomerReportDocument{
		Title:        "Računi po kupcih",
		BusinessYear: businessYear,
		DateRange:    invoiceReportDateRange(issuedFrom, issuedTo),
		GeneratedAt:  time.Now().Format("2.1.2006 15:04"),
		ResultPage:   fmt.Sprintf("Stran rezultatov %d od %d", summaryPage.Page, summaryPage.TotalPages),
		Customers:    customers,
	}
	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		CSS      template.CSS
		Document invoiceCustomerReportDocument
	}{CSS: template.CSS(invoiceCustomerReportCSSTemplate), Document: document}); err != nil {
		return nil, fmt.Errorf("render invoice customer report HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, renderedHTML.Bytes())
}

func invoiceCustomerReportName(code *string, name *string) string {
	customerCode := trimmedString(code)
	customerName := trimmedString(name)
	switch {
	case customerName != "" && customerCode != "":
		return customerName + " (" + customerCode + ")"
	case customerName != "":
		return customerName
	case customerCode != "":
		return customerCode
	default:
		return "Neznani kupec"
	}
}

func invoiceCustomerReportFilename(from *time.Time, to *time.Time) string {
	parts := []string{"racuni-po-kupcih"}
	if from != nil {
		parts = append(parts, from.Format("2006-01-02"))
	}
	if to != nil {
		parts = append(parts, to.Format("2006-01-02"))
	}
	return strings.Join(parts, "-") + ".pdf"
}
