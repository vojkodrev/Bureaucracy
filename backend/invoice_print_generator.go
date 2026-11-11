package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"html/template"
	"sort"
	"strings"

	"bureaucracy/backend/lib"
)

type invoicePrintDocument struct {
	XMLName             xml.Name             `xml:"invoice"`
	InvoiceNumber       string               `xml:"number"`
	Title               string               `xml:"title"`
	IssueDate           string               `xml:"issueDate"`
	DueDate             string               `xml:"dueDate"`
	ServiceDate         string               `xml:"serviceDate"`
	IssuePlace          string               `xml:"issuePlace"`
	PurchaseOrderNumber string               `xml:"purchaseOrderNumber"`
	Customer            invoicePrintCustomer `xml:"customer"`
	IntroText           string               `xml:"introText"`
	Items               []invoicePrintItem   `xml:"items>item"`
	NetTotal            string               `xml:"totals>net"`
	TaxTotal            string               `xml:"totals>tax"`
	GrossTotal          string               `xml:"totals>gross"`
	AmountInWords       string               `xml:"amountInWords"`
	TaxSummaries        []invoicePrintTax    `xml:"taxes>tax"`
	ClosingText         string               `xml:"closingText"`
	PaymentQRCode       string               `xml:"paymentQRCode"`
	DocumentLabel       string               `xml:"documentLabel"`
	ShowDueDate         bool                 `xml:"showDueDate"`
	ShowOriginalInvoice bool                 `xml:"showOriginalInvoice"`
}

type invoicePrintCustomer struct {
	Name     string `xml:"name"`
	Address  string `xml:"address"`
	Location string `xml:"location"`
	Country  string `xml:"country"`
	TaxID    string `xml:"taxId"`
}

type invoicePrintItem struct {
	Sequence              string `xml:"sequence"`
	Description           string `xml:"description"`
	Quantity              string `xml:"quantity"`
	Unit                  string `xml:"unit"`
	UnitPrice             string `xml:"unitPrice"`
	Discount              string `xml:"discount"`
	DiscountAmount        string `xml:"discountAmount"`
	DiscountedPrice       string `xml:"discountedPrice"`
	TaxRate               string `xml:"taxRate"`
	UnitPriceWithTax      string `xml:"unitPriceWithTax"`
	NetAmount             string `xml:"netAmount"`
	OriginalInvoiceNumber string `xml:"originalInvoiceNumber"`
}

type invoicePrintTax struct {
	Description string `xml:"description"`
	Rate        string `xml:"rate"`
	NetAmount   string `xml:"netAmount"`
	TaxAmount   string `xml:"taxAmount"`
}

//go:embed print/invoice/template.html
var htmlTemplate string

//go:embed print/invoice/template.css
var cssTemplate string

//go:embed print/invoice/logo.webp
var logo []byte

//go:embed print/invoice/signature.webp
var signature []byte

type InvoicePrintGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

type InvoicePrintDocumentType string

const (
	InvoicePrintDocument    InvoicePrintDocumentType = "Račun"
	CreditNotePrintDocument InvoicePrintDocumentType = "Dobropis"
)

func NewInvoicePrintGenerator(pdfRenderer *HTMLPDFRenderer) (*InvoicePrintGenerator, error) {
	tmpl, err := template.New("invoice").Parse(documentHeaderHTMLTemplate + htmlTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice print template: %w", err)
	}
	return &InvoicePrintGenerator{
		template:    tmpl,
		pdfRenderer: pdfRenderer,
	}, nil
}

func (generator *InvoicePrintGenerator) Generate(
	ctx context.Context,
	invoice *Invoice,
	businessYear int,
	documentType InvoicePrintDocumentType,
) ([]byte, error) {
	if invoice == nil {
		return nil, fmt.Errorf("invoice is required")
	}
	if err := validateInvoiceGrossTotal(invoice); err != nil {
		return nil, err
	}
	displayNumber := fmt.Sprintf("%s/%d", invoice.InvoiceNumber, businessYear)
	printItems, taxSummaries, calculatedTotals := buildPrintItems(invoice.Items)
	netTotal := float64OrZero(invoice.NetTotal)
	grossTotal := float64OrZero(invoice.Amount)
	if invoice.NetTotal == nil {
		netTotal = sumInvoiceNet(invoice.Items)
	}
	if invoice.Amount == nil {
		grossTotal = sumInvoiceGross(invoice.Items)
	}
	taxTotal := grossTotal - netTotal
	introText := trimmedString(invoice.IntroductoryText)
	if deliveryNoteNumber := trimmedString(invoice.DeliveryNoteNumber); deliveryNoteNumber != "" && deliveryNoteNumber != "New" {
		if introText != "" {
			introText += ", "
		}
		introText += "dob: " + deliveryNoteNumber
	}
	if err := validateCalculatedInvoiceTotals(invoice, netTotal, taxTotal, grossTotal, calculatedTotals); err != nil {
		return nil, err
	}
	paymentQRCode := ""
	if documentType == InvoicePrintDocument {
		generatedQRCode, qrError := generateUPNQRCode(invoice, displayNumber, grossTotal)
		if qrError != nil {
			return nil, qrError
		}
		paymentQRCode = generatedQRCode
	}

	xmlDocument, err := xml.Marshal(invoicePrintDocument{
		InvoiceNumber:       displayNumber,
		Title:               strings.TrimSpace(trimmedString(invoice.CustomerName) + " " + displayNumber),
		IssueDate:           formatDocumentDate(invoice.IssueDate),
		DueDate:             formatDocumentDate(invoice.DueDate),
		ServiceDate:         formatDocumentDate(invoice.ServiceDate),
		IssuePlace:          valueOrDefault(invoice.IssuePlace, "1000 Ljubljana"),
		PurchaseOrderNumber: trimmedString(invoice.PurchaseOrderNumber),
		Customer: invoicePrintCustomer{
			Name:     trimmedString(invoice.CustomerName),
			Address:  trimmedString(invoice.CustomerAddress),
			Location: customerLocation(invoice.CustomerPostalCode, invoice.CustomerCity),
			Country:  foreignCustomerCountry(invoice.CustomerCountry, invoice.CustomerCountryName),
			TaxID:    trimmedString(invoice.CustomerTaxID),
		},
		IntroText:           introText,
		Items:               printItems,
		NetTotal:            formatMoneyAmount(netTotal),
		TaxTotal:            formatMoneyAmount(taxTotal),
		GrossTotal:          formatMoneyAmount(grossTotal),
		AmountInWords:       lib.SlovenianAmountInWords(grossTotal),
		TaxSummaries:        taxSummaries,
		ClosingText:         strings.ReplaceAll(trimmedString(invoice.ClosingText), "#ŠTEVILKA#", displayNumber),
		PaymentQRCode:       paymentQRCode,
		DocumentLabel:       string(documentType),
		ShowDueDate:         documentType != CreditNotePrintDocument || invoice.DueDate != nil,
		ShowOriginalInvoice: documentType == CreditNotePrintDocument,
	})
	if err != nil {
		return nil, fmt.Errorf("create invoice XML: %w", err)
	}
	var printDocument invoicePrintDocument
	if err := xml.Unmarshal(xmlDocument, &printDocument); err != nil {
		return nil, fmt.Errorf("read invoice XML: %w", err)
	}

	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		CSS       template.CSS
		Document  invoicePrintDocument
		Header    documentPrintHeader
		Signature template.URL
		PaymentQR template.URL
	}{
		CSS:       template.CSS(documentHeaderCSSTemplate + cssTemplate),
		Document:  printDocument,
		Header:    documentPrintHeader{Customer: printDocument.Customer, Logo: template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(logo))},
		Signature: template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(signature)),
		PaymentQR: template.URL(printDocument.PaymentQRCode),
	}); err != nil {
		return nil, fmt.Errorf("render invoice HTML: %w", err)
	}

	return generator.pdfRenderer.Render(ctx, renderedHTML.Bytes())
}

func valueOrDefault(value *string, fallback string) string {
	if result := trimmedString(value); result != "" {
		return result
	}
	return fallback
}

func customerLocation(postalCode *string, city *string) string {
	postal := trimmedString(postalCode)
	location := trimmedString(city)
	if postal == "" || strings.HasPrefix(strings.ToUpper(location), strings.ToUpper(postal)) {
		return location
	}
	if location == "" {
		return postal
	}
	return postal + "    " + location
}

func foreignCustomerCountry(code *string, name *string) string {
	if strings.EqualFold(trimmedString(code), "SLO") {
		return ""
	}
	return valueOrDefault(name, trimmedString(code))
}

func buildPrintItems(items []*InvoiceItem) ([]invoicePrintItem, []invoicePrintTax, calculatedInvoiceTotals) {
	printItems := make([]invoicePrintItem, 0, len(items))
	taxGroups := make(map[float64][2]float64)
	calculatedTotals := calculatedInvoiceTotals{}
	for index, item := range items {
		if item == nil {
			continue
		}
		amounts := calculateInvoiceItemAmounts(item)
		calculatedTotals.gross += lib.CurrencyCents(amounts.GrossAmount)
		group := taxGroups[amounts.TaxRate]
		taxGroups[amounts.TaxRate] = [2]float64{group[0] + amounts.NetAmount, group[1] + amounts.GrossAmount - amounts.NetAmount}

		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		printItems = append(printItems, invoicePrintItem{
			Sequence:        fmt.Sprintf("%d", sequence),
			Description:     strings.TrimSpace(trimmedString(item.ProductName)),
			Quantity:        formatQuantity(amounts.Quantity),
			Unit:            trimmedString(item.Unit),
			UnitPrice:       formatMoneyAmount(amounts.UnitPrice),
			Discount:        formatPercentage(amounts.Discount),
			DiscountAmount:  formatMoneyAmount(amounts.DiscountAmount),
			DiscountedPrice: formatMoneyAmount(amounts.DiscountedUnitPrice),
			TaxRate:         formatPercentage(amounts.TaxRate),
			UnitPriceWithTax: formatMoneyAmount(
				lib.DivideOrZero(amounts.GrossAmount, amounts.Quantity),
			),
			NetAmount:             formatMoneyAmount(amounts.NetAmount),
			OriginalInvoiceNumber: trimmedString(item.OriginalInvoiceNumber),
		})
	}

	rates := make([]float64, 0, len(taxGroups))
	for rate := range taxGroups {
		rates = append(rates, rate)
	}
	sort.Float64s(rates)
	taxes := make([]invoicePrintTax, 0, len(rates))
	for _, rate := range rates {
		amounts := taxGroups[rate]
		calculatedTotals.net += lib.CurrencyCents(amounts[0])
		calculatedTotals.vat += lib.CurrencyCents(amounts[1])
		taxes = append(taxes, invoicePrintTax{
			Description: "DDV " + formatPercentage(rate),
			Rate:        formatMoneyAmount(rate),
			NetAmount:   formatMoneyAmount(amounts[0]),
			TaxAmount:   formatMoneyAmount(amounts[1]),
		})
	}
	return printItems, taxes, calculatedTotals
}

func sumInvoiceNet(items []*InvoiceItem) float64 {
	var total float64
	for _, item := range items {
		if item != nil {
			total += float64OrZero(item.NetAmount)
		}
	}
	return total
}

func sumInvoiceGross(items []*InvoiceItem) float64 {
	var total float64
	for _, item := range items {
		if item != nil {
			total += float64OrZero(item.GrossAmount)
		}
	}
	return total
}
