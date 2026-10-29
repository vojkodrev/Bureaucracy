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
	Summary      []invoiceCustomerReportTotal
}

type invoiceCustomerReportSection struct {
	Customer string
	Invoices []invoiceReportRow
	Totals   []invoiceCustomerReportTotal
}

type invoiceCustomerReportTotal struct {
	Label  string
	Amount string
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
	paymentStatus string,
) ([]byte, error) {
	if summaryPage == nil {
		return nil, fmt.Errorf("invoice customer summary page is required")
	}

	customers := make([]invoiceCustomerReportSection, 0, len(summaryPage.CustomerSummaries))
	invoices := make([]*Invoice, 0, summaryPage.PageSize)
	for _, summary := range summaryPage.CustomerSummaries {
		if summary == nil {
			continue
		}
		rows := make([]invoiceReportRow, 0, len(summary.Invoices))
		for _, invoice := range summary.Invoices {
			if invoice == nil {
				continue
			}
			invoices = append(invoices, invoice)
			rows = append(rows, invoiceReportRow{
				InvoiceNumber: invoice.InvoiceNumber,
				Amount:        formatMoneyAmount(float64OrZero(invoice.Amount)),
				IssueDate:     formatDocumentDate(invoice.IssueDate),
				DueDate:       formatDocumentDate(invoice.DueDate),
				PaymentDate:   formatDocumentDate(invoice.PaymentDate),
			})
		}
		customers = append(customers, invoiceCustomerReportSection{
			Customer: invoiceCustomerReportName(summary.CustomerCode, summary.CustomerName),
			Invoices: rows,
			Totals: invoiceCustomerReportTotals(paymentStatus, []invoiceCustomerReportTotal{
				{Label: "Plačano", Amount: formatMoneyAmount(summary.TotalPaid)},
				{Label: "Neplačano", Amount: formatMoneyAmount(summary.TotalOutstanding)},
				{Label: "Od tega zapadlo", Amount: formatMoneyAmount(summary.TotalOverdue)},
				{Label: "Skupaj zaračunano", Amount: formatMoneyAmount(summary.TotalInvoiced)},
			}),
		})
	}
	totals := calculateInvoiceReportTotals(invoices, time.Now())

	document := invoiceCustomerReportDocument{
		Title:        "Računi po kupcih",
		BusinessYear: businessYear,
		DateRange:    invoiceReportDateRange(issuedFrom, issuedTo),
		GeneratedAt:  time.Now().Format("2.1.2006 15:04"),
		ResultPage:   fmt.Sprintf("Stran rezultatov %d od %d", summaryPage.Page, summaryPage.TotalPages),
		Customers:    customers,
		Summary: invoiceCustomerReportTotals(paymentStatus, []invoiceCustomerReportTotal{
			{Label: "Skupni znesek", Amount: formatMoneyAmount(totals.Total)},
			{Label: "Neplačano", Amount: formatMoneyAmount(totals.Unpaid)},
			{Label: "Zapadlo", Amount: formatMoneyAmount(totals.PastDue)},
			{Label: "Plačano", Amount: formatMoneyAmount(totals.Paid)},
		}),
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

func invoiceCustomerReportTotals(paymentStatus string, totals []invoiceCustomerReportTotal) []invoiceCustomerReportTotal {
	switch strings.TrimSpace(paymentStatus) {
	case "paid":
		totals = totals[3:4]
	case "overdue":
		totals = totals[2:3]
		totals[0].Label = "Skupaj zapadlo"
	}
	return totals
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
