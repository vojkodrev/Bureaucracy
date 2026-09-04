package main

import (
	"bytes"
	_ "embed"
	"encoding/xml"
	"fmt"
	"html"
	"html/template"
	"strconv"
	"strings"
)

type document struct {
	XMLName       xml.Name `xml:"invoice"`
	InvoiceNumber string   `xml:"number"`
}

//go:embed print/invoice/template.html
var htmlTemplate string

//go:embed print/invoice/template.css
var cssTemplate string

type InvoicePrintGenerator struct {
	template *template.Template
}

func NewInvoicePrintGenerator() (*InvoicePrintGenerator, error) {
	tmpl, err := template.New("invoice").Parse(htmlTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice print template: %w", err)
	}
	return &InvoicePrintGenerator{template: tmpl}, nil
}

func (generator *InvoicePrintGenerator) Generate(invoiceNumber string) ([]byte, error) {
	invoiceNumber = strings.TrimSpace(invoiceNumber)
	if invoiceNumber == "" {
		return nil, fmt.Errorf("invoice number is required")
	}

	// This round trip establishes XML as the source document. Replace this
	// temporary model with XML built from InvoiceRepository data later.
	xmlDocument, err := xml.Marshal(document{InvoiceNumber: invoiceNumber})
	if err != nil {
		return nil, fmt.Errorf("create invoice XML: %w", err)
	}
	var printDocument document
	if err := xml.Unmarshal(xmlDocument, &printDocument); err != nil {
		return nil, fmt.Errorf("read invoice XML: %w", err)
	}

	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		CSS      template.CSS
		Document document
	}{CSS: template.CSS(cssTemplate), Document: printDocument}); err != nil {
		return nil, fmt.Errorf("render invoice HTML: %w", err)
	}

	// The initial renderer supports the plain text inside <main>. HTML/CSS remains
	// the presentation boundary for the complete invoice renderer added later.
	htmlDocument := renderedHTML.String()
	mainElement := strings.Index(htmlDocument, "<main")
	if mainElement < 0 {
		return nil, fmt.Errorf("invoice HTML does not contain printable content")
	}
	contentStart := strings.Index(htmlDocument[mainElement:], ">")
	if contentStart < 0 {
		return nil, fmt.Errorf("invoice HTML contains an invalid main element")
	}
	contentStart += mainElement + 1
	contentEnd := strings.Index(htmlDocument[contentStart:], "</main>")
	if contentEnd < 0 {
		return nil, fmt.Errorf("invoice HTML contains an invalid main element")
	}
	text := strings.TrimSpace(html.UnescapeString(htmlDocument[contentStart : contentStart+contentEnd]))
	return onePageA4PDF(text), nil
}

func onePageA4PDF(text string) []byte {
	escapedText := strings.NewReplacer(`\`, `\\`, `(`, `\(`, `)`, `\)`).Replace(text)
	stream := "BT\n/F1 18 Tf\n56.7 785 Td\n(" + escapedText + ") Tj\nET\n"
	objects := []string{
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
		"<< /Length " + strconv.Itoa(len(stream)) + " >>\nstream\n" + stream + "endstream",
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
	}

	var pdf bytes.Buffer
	pdf.WriteString("%PDF-1.4\n")
	offsets := make([]int, len(objects)+1)
	for index, object := range objects {
		offsets[index+1] = pdf.Len()
		fmt.Fprintf(&pdf, "%d 0 obj\n%s\nendobj\n", index+1, object)
	}
	xrefOffset := pdf.Len()
	fmt.Fprintf(&pdf, "xref\n0 %d\n0000000000 65535 f \n", len(objects)+1)
	for _, offset := range offsets[1:] {
		fmt.Fprintf(&pdf, "%010d 00000 n \n", offset)
	}
	fmt.Fprintf(&pdf, "trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n", len(objects)+1, xrefOffset)
	return pdf.Bytes()
}
