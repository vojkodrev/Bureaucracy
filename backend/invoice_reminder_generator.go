package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/base64"
	"fmt"
	"html/template"
	"sort"
	"time"
)

type invoiceReminderDocument struct {
	CustomerName string
	Address      string
	Location     string
	BusinessYear int
	GeneratedAt  string
	Invoices     []invoiceReminderRow
	Total        string
}

type invoiceReminderRow struct {
	InvoiceNumber string
	IssueDate     string
	DueDate       string
	Amount        string
}

//go:embed print/invoice-reminder/template.html
var invoiceReminderHTMLTemplate string

//go:embed print/invoice-reminder/template.css
var invoiceReminderCSSTemplate string

//go:embed print/invoice/signature.webp
var invoiceReminderSignature []byte

//go:embed print/invoice/logo.webp
var invoiceReminderLogo []byte

type InvoiceReminderGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewInvoiceReminderGenerator(pdfRenderer *HTMLPDFRenderer) (*InvoiceReminderGenerator, error) {
	tmpl, err := template.New("invoice-reminder").Parse(invoiceReminderHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice reminder print template: %w", err)
	}
	return &InvoiceReminderGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *InvoiceReminderGenerator) Generate(ctx context.Context, invoicePage *InvoicePage, businessYear int) ([]byte, error) {
	if invoicePage == nil {
		return nil, fmt.Errorf("invoice page is required")
	}
	now := time.Now()
	grouped := make(map[string][]*Invoice)
	for _, invoice := range invoicePage.Invoices {
		if invoice == nil || invoice.PaymentDate != nil || invoice.DueDate == nil || !invoice.DueDate.Before(now) {
			continue
		}
		key := trimmedString(invoice.CustomerCode) + "\x00" + trimmedString(invoice.CustomerName)
		grouped[key] = append(grouped[key], invoice)
	}
	keys := make([]string, 0, len(grouped))
	for key := range grouped {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	documents := make([]invoiceReminderDocument, 0, len(keys))
	for _, key := range keys {
		invoices := grouped[key]
		first := invoices[0]
		rows := make([]invoiceReminderRow, 0, len(invoices))
		var total float64
		for _, invoice := range invoices {
			amount := float64OrZero(invoice.Amount)
			total += amount
			rows = append(rows, invoiceReminderRow{
				InvoiceNumber: invoice.InvoiceNumber + "/" + fmt.Sprint(businessYear),
				IssueDate:     formatDocumentDate(invoice.IssueDate), DueDate: formatDocumentDate(invoice.DueDate),
				Amount: formatMoneyAmount(amount),
			})
		}
		documents = append(documents, invoiceReminderDocument{
			CustomerName: trimmedString(first.CustomerName),
			Address:      trimmedString(first.CustomerAddress), Location: customerLocation(first.CustomerPostalCode, first.CustomerCity),
			BusinessYear: businessYear, GeneratedAt: now.Format("2.1.2006"), Invoices: rows,
			Total: formatMoneyAmount(total),
		})
	}
	title := "Opomin"
	if len(documents) > 0 && documents[0].CustomerName != "" {
		title = documents[0].CustomerName + " Opomin"
	}

	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		Title     string
		CSS       template.CSS
		Documents []invoiceReminderDocument
		Logo      template.URL
		Signature template.URL
	}{
		Title: title, CSS: template.CSS(invoiceReminderCSSTemplate), Documents: documents,
		Logo:      template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(invoiceReminderLogo)),
		Signature: template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(invoiceReminderSignature)),
	}); err != nil {
		return nil, fmt.Errorf("render invoice reminder HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, renderedHTML.Bytes())
}

func invoiceReminderFilename() string {
	return "opomini-" + time.Now().Format("2006-01-02") + ".pdf"
}
