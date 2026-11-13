package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/base64"
	"fmt"
	"html/template"
	"strings"
)

//go:embed print/delivery-note/template.html
var deliveryNoteHTMLTemplate string

//go:embed print/delivery-note/template.css
var deliveryNoteCSSTemplate string

type DeliveryNotePrintGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewDeliveryNotePrintGenerator(pdfRenderer *HTMLPDFRenderer) (*DeliveryNotePrintGenerator, error) {
	tmpl, err := template.New("delivery-note").Parse(documentHeaderHTMLTemplate + deliveryNoteHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse delivery note print template: %w", err)
	}
	return &DeliveryNotePrintGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *DeliveryNotePrintGenerator) Generate(
	ctx context.Context,
	note *DeliveryNote,
	businessYear int,
) ([]byte, error) {
	if note == nil {
		return nil, fmt.Errorf("delivery note is required")
	}
	displayNumber := fmt.Sprintf("%s/%d", note.DeliveryNoteNumber, businessYear)
	items, _, _ := buildPrintItems(note.Items)
	netTotal := sumInvoiceNet(note.Items)
	grossTotal := float64OrZero(note.Amount)
	if note.Amount == nil {
		grossTotal = sumInvoiceGross(note.Items)
	}
	document := invoicePrintDocument{
		InvoiceNumber: displayNumber,
		Title:         strings.TrimSpace(trimmedString(note.CustomerName) + " " + displayNumber),
		IssueDate:     formatDocumentDate(note.IssueDate), DueDate: formatDocumentDate(note.DeliveryDate),
		IssuePlace: valueOrDefault(note.IssuePlace, "1000 Ljubljana"),
		Customer: invoicePrintCustomer{
			Name:     trimmedString(note.CustomerName),
			Address:  trimmedString(note.CustomerAddress),
			Location: customerLocation(note.CustomerPostalCode, note.CustomerCity),
			TaxID:    trimmedString(note.CustomerTaxID),
		},
		IntroText: trimmedString(note.IntroductoryText), Items: items,
		NetTotal: formatMoneyAmount(netTotal), TaxTotal: formatMoneyAmount(grossTotal - netTotal),
		GrossTotal: formatMoneyAmount(grossTotal), ClosingText: trimmedString(note.ClosingText),
	}
	var rendered bytes.Buffer
	err := generator.template.Execute(&rendered, struct {
		CSS            template.CSS
		Document       invoicePrintDocument
		Header         documentPrintHeader
		Signature      template.URL
		WithoutAmounts bool
	}{
		CSS: template.CSS(documentHeaderCSSTemplate + deliveryNoteCSSTemplate), Document: document,
		Header: documentPrintHeader{
			Customer: document.Customer,
			Logo: template.URL(
				"data:image/webp;base64," + base64.StdEncoding.EncodeToString(logo),
			),
		},
		Signature: template.URL(
			"data:image/webp;base64," + base64.StdEncoding.EncodeToString(signature),
		),
		WithoutAmounts: note.WithoutAmounts,
	})
	if err != nil {
		return nil, fmt.Errorf("render delivery note HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, rendered.Bytes())
}
