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
}

type invoicePrintCustomer struct {
	Name     string `xml:"name"`
	Address  string `xml:"address"`
	Location string `xml:"location"`
	TaxID    string `xml:"taxId"`
}

type invoicePrintItem struct {
	Sequence         string `xml:"sequence"`
	Description      string `xml:"description"`
	Quantity         string `xml:"quantity"`
	Unit             string `xml:"unit"`
	UnitPrice        string `xml:"unitPrice"`
	Discount         string `xml:"discount"`
	DiscountAmount   string `xml:"discountAmount"`
	DiscountedPrice  string `xml:"discountedPrice"`
	TaxRate          string `xml:"taxRate"`
	UnitPriceWithTax string `xml:"unitPriceWithTax"`
	NetAmount        string `xml:"netAmount"`
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

func NewInvoicePrintGenerator(pdfRenderer *HTMLPDFRenderer) (*InvoicePrintGenerator, error) {
	tmpl, err := template.New("invoice").Parse(htmlTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice print template: %w", err)
	}
	return &InvoicePrintGenerator{
		template:    tmpl,
		pdfRenderer: pdfRenderer,
	}, nil
}

func (generator *InvoicePrintGenerator) Generate(ctx context.Context, invoice *Invoice, businessYear int) ([]byte, error) {
	if invoice == nil {
		return nil, fmt.Errorf("invoice is required")
	}
	displayNumber := fmt.Sprintf("%s/%d", invoice.InvoiceNumber, businessYear)
	printItems, taxSummaries := buildPrintItems(invoice.Items)
	netTotal := float64OrZero(invoice.GoodsAmount)
	grossTotal := float64OrZero(invoice.Amount)
	if invoice.GoodsAmount == nil {
		netTotal = sumInvoiceNet(invoice.Items)
	}
	if invoice.Amount == nil {
		grossTotal = sumInvoiceGross(invoice.Items)
	}
	introText := trimmedString(invoice.IntroductoryText)
	if deliveryNoteNumber := trimmedString(invoice.DeliveryNoteNumber); deliveryNoteNumber != "" {
		if introText != "" {
			introText += ", "
		}
		introText += "dob: " + deliveryNoteNumber
	}
	paymentQRCode, err := generateUPNQRCode(invoice, displayNumber, grossTotal)
	if err != nil {
		return nil, err
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
			TaxID:    trimmedString(invoice.CustomerTaxID),
		},
		IntroText:     introText,
		Items:         printItems,
		NetTotal:      formatMoneyAmount(netTotal),
		TaxTotal:      formatMoneyAmount(grossTotal - netTotal),
		GrossTotal:    formatMoneyAmount(grossTotal),
		AmountInWords: amountInWords(grossTotal),
		TaxSummaries:  taxSummaries,
		ClosingText:   strings.ReplaceAll(trimmedString(invoice.ClosingText), "#ŠTEVILKA#", displayNumber),
		PaymentQRCode: paymentQRCode,
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
		Logo      template.URL
		Signature template.URL
		PaymentQR template.URL
	}{
		CSS:       template.CSS(cssTemplate),
		Document:  printDocument,
		Logo:      template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(logo)),
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

func buildPrintItems(items []*InvoiceItem) ([]invoicePrintItem, []invoicePrintTax) {
	printItems := make([]invoicePrintItem, 0, len(items))
	taxGroups := make(map[float64][2]float64)
	for index, item := range items {
		if item == nil {
			continue
		}
		quantity := float64OrZero(item.Quantity)
		netAmount := float64OrZero(item.NetAmount)
		grossAmount := float64OrZero(item.GrossAmount)
		discount := float64OrZero(item.Discount)
		discountedUnitPrice := divide(netAmount, quantity)
		originalNetAmount := netAmount
		if discount > 0 && discount < 100 {
			originalNetAmount = netAmount / (1 - discount/100)
		}
		rate := float64OrZero(item.TaxRate)
		group := taxGroups[rate]
		taxGroups[rate] = [2]float64{group[0] + netAmount, group[1] + grossAmount - netAmount}

		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		printItems = append(printItems, invoicePrintItem{
			Sequence:         fmt.Sprintf("%d", sequence),
			Description:      strings.TrimSpace(trimmedString(item.ProductName)),
			Quantity:         formatQuantity(quantity),
			Unit:             trimmedString(item.Unit),
			UnitPrice:        formatMoneyAmount(divide(originalNetAmount, quantity)),
			Discount:         formatPercentage(discount),
			DiscountAmount:   formatMoneyAmount(originalNetAmount - netAmount),
			DiscountedPrice:  formatMoneyAmount(discountedUnitPrice),
			TaxRate:          formatPercentage(rate),
			UnitPriceWithTax: formatMoneyAmount(divide(grossAmount, quantity)),
			NetAmount:        formatMoneyAmount(netAmount),
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
		taxes = append(taxes, invoicePrintTax{
			Description: "DDV " + formatPercentage(rate),
			Rate:        formatMoneyAmount(rate),
			NetAmount:   formatMoneyAmount(amounts[0]),
			TaxAmount:   formatMoneyAmount(amounts[1]),
		})
	}
	return printItems, taxes
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

func divide(value float64, divisor float64) float64 {
	if divisor == 0 {
		return 0
	}
	return value / divisor
}

func amountInWords(value float64) string {
	whole := int64(value)
	cents := int64((value-float64(whole))*100 + 0.5)
	if cents == 100 {
		whole++
		cents = 0
	}
	return slovenianInteger(whole) + fmt.Sprintf(" %02d/100", cents)
}

func slovenianInteger(value int64) string {
	if value == 0 {
		return "nič"
	}
	if value < 0 {
		return "minus " + slovenianInteger(-value)
	}
	if value >= 1000 {
		thousands := value / 1000
		prefix := slovenianInteger(thousands) + " tisoč"
		if thousands == 1 {
			prefix = "tisoč"
		}
		if remainder := value % 1000; remainder != 0 {
			return prefix + " " + slovenianInteger(remainder)
		}
		return prefix
	}
	result := ""
	if value >= 100 {
		hundreds := []string{"", "sto", "dvesto", "tristo", "štiristo", "petsto", "šeststo", "sedemsto", "osemsto", "devetsto"}
		result = hundreds[value/100]
		value %= 100
	}
	if value > 0 {
		if result != "" {
			result += " "
		}
		units := []string{"", "ena", "dva", "tri", "štiri", "pet", "šest", "sedem", "osem", "devet"}
		teens := []string{"deset", "enajst", "dvanajst", "trinajst", "štirinajst", "petnajst", "šestnajst", "sedemnajst", "osemnajst", "devetnajst"}
		tens := []string{"", "", "dvajset", "trideset", "štirideset", "petdeset", "šestdeset", "sedemdeset", "osemdeset", "devetdeset"}
		switch {
		case value < 10:
			result += units[value]
		case value < 20:
			result += teens[value-10]
		case value%10 == 0:
			result += tens[value/10]
		default:
			result += units[value%10] + "in" + tens[value/10]
		}
	}
	return result
}
