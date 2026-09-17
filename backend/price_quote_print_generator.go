package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"html/template"
	"strings"
)

//go:embed print/price-quote/template.html
var priceQuoteHTMLTemplate string

//go:embed print/price-quote/template.css
var priceQuoteCSSTemplate string

type PriceQuotePrintGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewPriceQuotePrintGenerator(pdfRenderer *HTMLPDFRenderer) (*PriceQuotePrintGenerator, error) {
	tmpl, err := template.New("price-quote").Parse(priceQuoteHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse price quote print template: %w", err)
	}
	return &PriceQuotePrintGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *PriceQuotePrintGenerator) Generate(
	ctx context.Context,
	quote *PriceQuote,
	businessYear int,
) ([]byte, error) {
	if quote == nil {
		return nil, fmt.Errorf("price quote is required")
	}
	displayNumber := fmt.Sprintf("%s-%d", quote.QuoteNumber, businessYear)
	items, taxes := buildPrintItems(quote.Items)
	netTotal := sumInvoiceNet(quote.Items)
	grossTotal := float64OrZero(quote.Amount)
	if quote.Amount == nil {
		grossTotal = sumInvoiceGross(quote.Items)
	}
	document := invoicePrintDocument{
		InvoiceNumber: displayNumber,
		Title:         strings.TrimSpace(trimmedString(quote.CustomerName) + " " + displayNumber),
		IssueDate:     formatDocumentDate(quote.IssueDate),
		DueDate:       formatDocumentDate(quote.DueDate),
		IssuePlace:    valueOrDefault(quote.IssuePlace, "1000 Ljubljana"),
		Customer: invoicePrintCustomer{
			Name: trimmedString(quote.CustomerName), Address: trimmedString(quote.CustomerAddress),
			Location: customerLocation(quote.CustomerPostalCode, quote.CustomerCity), TaxID: trimmedString(quote.CustomerTaxID),
		},
		IntroText: trimmedString(quote.IntroductoryText), Items: items,
		NetTotal: formatMoneyAmount(netTotal), TaxTotal: formatMoneyAmount(grossTotal - netTotal),
		GrossTotal: formatMoneyAmount(grossTotal), AmountInWords: amountInWords(grossTotal),
		TaxSummaries: taxes,
		ClosingText:  strings.ReplaceAll(trimmedString(quote.ClosingText), "#ŠTEVILKA#", displayNumber),
	}
	serialized, err := xml.Marshal(document)
	if err != nil {
		return nil, fmt.Errorf("create price quote XML: %w", err)
	}
	if err = xml.Unmarshal(serialized, &document); err != nil {
		return nil, fmt.Errorf("read price quote XML: %w", err)
	}
	var rendered bytes.Buffer
	err = generator.template.Execute(&rendered, struct {
		CSS       template.CSS
		Document  invoicePrintDocument
		Logo      template.URL
		Signature template.URL
	}{
		CSS: template.CSS(priceQuoteCSSTemplate), Document: document,
		Logo:      template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(logo)),
		Signature: template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(signature)),
	})
	if err != nil {
		return nil, fmt.Errorf("render price quote HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, rendered.Bytes())
}
