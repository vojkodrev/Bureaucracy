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

type invoiceReportDocument struct {
	Title        string
	BusinessYear int
	DateRange    string
	GeneratedAt  string
	ResultPage   string
	Invoices     []invoiceReportRow
	Total        string
	Unpaid       string
	PastDue      string
	Paid         string
}

type invoiceReportRow struct {
	InvoiceNumber string
	Customer      string
	Amount        string
	IssueDate     string
	DueDate       string
	PaymentDate   string
}

type invoiceReportTotals struct {
	Total   float64
	Unpaid  float64
	PastDue float64
	Paid    float64
}

//go:embed print/invoice-report/template.html
var invoiceReportHTMLTemplate string

//go:embed print/invoice-report/template.css
var invoiceReportCSSTemplate string

type InvoiceReportGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewInvoiceReportGenerator(pdfRenderer *HTMLPDFRenderer) (*InvoiceReportGenerator, error) {
	tmpl, err := template.New("invoice-report").Parse(invoiceReportHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice report print template: %w", err)
	}
	return &InvoiceReportGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *InvoiceReportGenerator) Generate(
	ctx context.Context,
	invoicePage *InvoicePage,
	businessYear int,
	issuedFrom *time.Time,
	issuedTo *time.Time,
) ([]byte, error) {
	if invoicePage == nil {
		return nil, fmt.Errorf("invoice page is required")
	}
	rows := make([]invoiceReportRow, 0, len(invoicePage.Invoices))
	for _, invoice := range invoicePage.Invoices {
		if invoice == nil {
			continue
		}
		amount := float64OrZero(invoice.Amount)
		customer := trimmedString(invoice.CustomerName)
		if customer == "" {
			customer = trimmedString(invoice.CustomerCode)
		}
		rows = append(rows, invoiceReportRow{
			InvoiceNumber: invoice.InvoiceNumber,
			Customer:      customer,
			Amount:        formatMoneyAmount(amount),
			IssueDate:     formatDocumentDate(invoice.IssueDate),
			DueDate:       formatDocumentDate(invoice.DueDate),
			PaymentDate:   formatDocumentDate(invoice.PaymentDate),
		})
	}
	totals := calculateInvoiceReportTotals(invoicePage.Invoices, time.Now())

	document := invoiceReportDocument{
		Title:        "Računi",
		BusinessYear: businessYear,
		DateRange:    invoiceReportDateRange(issuedFrom, issuedTo),
		GeneratedAt:  time.Now().Format("2.1.2006 15:04"),
		ResultPage:   fmt.Sprintf("Stran rezultatov %d od %d", invoicePage.Page, invoicePage.TotalPages),
		Invoices:     rows,
		Total:        formatMoneyAmount(totals.Total),
		Unpaid:       formatMoneyAmount(totals.Unpaid),
		PastDue:      formatMoneyAmount(totals.PastDue),
		Paid:         formatMoneyAmount(totals.Paid),
	}
	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		CSS      template.CSS
		Document invoiceReportDocument
	}{CSS: template.CSS(invoiceReportCSSTemplate), Document: document}); err != nil {
		return nil, fmt.Errorf("render invoice report HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, renderedHTML.Bytes())
}

func calculateInvoiceReportTotals(invoices []*Invoice, now time.Time) invoiceReportTotals {
	var totals invoiceReportTotals
	for _, invoice := range invoices {
		if invoice == nil {
			continue
		}
		amount := float64OrZero(invoice.Amount)
		totals.Total += amount
		if invoice.PaymentDate != nil {
			totals.Paid += amount
			continue
		}
		totals.Unpaid += amount
		if invoice.DueDate != nil && invoice.DueDate.Before(now) {
			totals.PastDue += amount
		}
	}
	return totals
}

func invoiceReportDateRange(from *time.Time, to *time.Time) string {
	switch {
	case from != nil && to != nil:
		return formatDocumentDate(from) + "–" + formatDocumentDate(to)
	case from != nil:
		return "od " + formatDocumentDate(from)
	case to != nil:
		return "do " + formatDocumentDate(to)
	default:
		return "vsi datumi"
	}
}

func invoiceReportFilename(from *time.Time, to *time.Time) string {
	parts := []string{"racuni"}
	if from != nil {
		parts = append(parts, from.Format("2006-01-02"))
	}
	if to != nil {
		parts = append(parts, to.Format("2006-01-02"))
	}
	return strings.Join(parts, "-") + ".pdf"
}
