package main

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/xml"
	"fmt"
	"io"
	"strings"
	"time"
)

const (
	halcomNamespace        = "hal:icl:01"
	halcomSenderName       = "DREVI D.O.O."
	halcomSenderCountry    = "SI"
	halcomSenderAddress    = "OB ŽELEZNICI 16"
	halcomSenderLocation   = "1000 LJUBLJANA"
	halcomSenderIdentifier = "35954086"
	halcomSenderEmail      = "DREV@SIOL.NET"
	halcomSenderPhone      = "041693605"
)

type halcomPackage struct {
	XMLName   xml.Name       `xml:"package"`
	Namespace string         `xml:"xmlns,attr"`
	XSI       string         `xml:"xmlns:xsi,attr"`
	Type      string         `xml:"pkg_type,attr"`
	Timestamp string         `xml:"timestamp"`
	Envelope  halcomEnvelope `xml:"envelope"`
}

type halcomEnvelope struct {
	Sender      halcomParty       `xml:"sender"`
	Receiver    halcomParty       `xml:"receiver"`
	Document    halcomDocument    `xml:"doc_data"`
	Payment     halcomPayment     `xml:"payment_data"`
	Attachments halcomAttachments `xml:"attachments"`
}

type halcomParty struct {
	Name               string         `xml:"name"`
	Country            string         `xml:"country"`
	Addresses          []string       `xml:"address"`
	SenderIdentifier   string         `xml:"sender_identifier,omitempty"`
	SenderElectronic   *halcomAddress `xml:"sender_eddress,omitempty"`
	ReceiverIdentifier string         `xml:"receiver_identifier,omitempty"`
	ReceiverElectronic *halcomAddress `xml:"receiver_eddress,omitempty"`
	Email              string         `xml:"email_id,omitempty"`
	Phone              string         `xml:"phone,omitempty"`
}

type halcomAddress struct {
	SenderAgent     string `xml:"sender_agent,omitempty"`
	SenderMailbox   string `xml:"sender_mailbox,omitempty"`
	ReceiverAgent   string `xml:"receiver_agent,omitempty"`
	ReceiverMailbox string `xml:"receiver_mailbox,omitempty"`
}

type halcomDocument struct {
	Type       string `xml:"doc_type"`
	Version    string `xml:"doc_type_ver"`
	ID         string `xml:"doc_id"`
	ExternalID string `xml:"external_doc_id"`
	Timestamp  string `xml:"timestamp"`
}

type halcomPayment struct {
	Method        string             `xml:"payment_method"`
	Creditor      halcomPaymentParty `xml:"creditor"`
	Debtor        halcomPaymentParty `xml:"debtor"`
	ExecutionDate string             `xml:"requested_execution_date"`
	Amount        string             `xml:"amount"`
	Currency      string             `xml:"currency"`
	Remittance    halcomRemittance   `xml:"remittance_information"`
	Purpose       string             `xml:"purpose"`
}

type halcomPaymentParty struct {
	Name     string   `xml:"name"`
	Country  string   `xml:"country"`
	Address  []string `xml:"address"`
	Agent    string   `xml:"creditor_agent,omitempty"`
	Account  string   `xml:"creditor_account,omitempty"`
	DAgent   string   `xml:"debtor_agent,omitempty"`
	DAccount string   `xml:"debtor_account,omitempty"`
}

type halcomRemittance struct {
	Reference   string `xml:"creditor_structured_reference"`
	Information string `xml:"additional_remittance_information"`
}

type halcomAttachments struct {
	Count int                `xml:"count"`
	Items []halcomAttachment `xml:"attachment"`
}

type halcomAttachment struct {
	Filename    string `xml:"filename"`
	Type        string `xml:"type"`
	Description string `xml:"description"`
}

type InvoiceHalcomGenerator struct {
	printGenerator *InvoicePrintGenerator
	xmlGenerator   *InvoiceXMLGenerator
}

func NewInvoiceHalcomGenerator(printGenerator *InvoicePrintGenerator, xmlGenerator *InvoiceXMLGenerator) *InvoiceHalcomGenerator {
	return &InvoiceHalcomGenerator{printGenerator: printGenerator, xmlGenerator: xmlGenerator}
}

func (generator *InvoiceHalcomGenerator) Generate(ctx context.Context, invoice *Invoice, businessYear int) ([]byte, error) {
	pdf, err := generator.printGenerator.Generate(ctx, invoice, businessYear)
	if err != nil {
		return nil, fmt.Errorf("generate invoice PDF: %w", err)
	}
	invoiceXML, err := generator.xmlGenerator.Generate(invoice, businessYear)
	if err != nil {
		return nil, fmt.Errorf("generate invoice XML: %w", err)
	}
	documentID, err := newHalcomDocumentID()
	if err != nil {
		return nil, err
	}
	baseFilename := documentID + "_" + documentID
	envelopeXML, err := generateHalcomEnvelope(invoice, businessYear, documentID, baseFilename+".xml", baseFilename+".pdf", time.Now())
	if err != nil {
		return nil, err
	}
	return createHalcomZIP(map[string][]byte{
		"envelope.xml":        envelopeXML,
		baseFilename + ".xml": invoiceXML,
		baseFilename + ".pdf": pdf,
	})
}

func newHalcomDocumentID() (string, error) {
	const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	random := make([]byte, 16)
	if _, err := rand.Read(random); err != nil {
		return "", fmt.Errorf("generate document ID: %w", err)
	}
	for i := range random {
		random[i] = alphabet[int(random[i])%len(alphabet)]
	}
	return strings.TrimSuffix(sellerBIC, "XXX") + string(random), nil
}

func generateHalcomEnvelope(invoice *Invoice, year int, documentID, xmlFilename, pdfFilename string, generatedAt time.Time) ([]byte, error) {
	if invoice == nil || invoice.IssueDate == nil || invoice.DueDate == nil {
		return nil, fmt.Errorf("invoice issue date and due date are required")
	}
	country := countryCode(valueOrDefault(invoice.CustomerCountry, "SI"))
	location := customerLocation(invoice.CustomerPostalCode, invoice.CustomerCity)
	amount := float64OrZero(invoice.Amount)
	if invoice.Amount == nil {
		amount = sumInvoiceGross(invoice.Items)
	}
	documentNumber := fmt.Sprintf("%s-%d", strings.TrimSpace(invoice.InvoiceNumber), year)
	document := halcomPackage{
		Namespace: halcomNamespace, XSI: "http://www.w3.org/2001/XMLSchema-instance", Type: "einvoice",
		Timestamp: generatedAt.Format("2006-01-02T15:04:05"),
		Envelope: halcomEnvelope{
			Sender:      halcomParty{Name: halcomSenderName, Country: halcomSenderCountry, Addresses: []string{halcomSenderAddress, halcomSenderLocation}, SenderIdentifier: halcomSenderIdentifier, SenderElectronic: &halcomAddress{SenderAgent: sellerBIC, SenderMailbox: sellerIBAN}, Email: halcomSenderEmail, Phone: halcomSenderPhone},
			Receiver:    halcomParty{Name: trimmedString(invoice.CustomerName), Country: country, Addresses: []string{trimmedString(invoice.CustomerAddress), location}, ReceiverIdentifier: trimmedString(invoice.CustomerTaxID), ReceiverElectronic: &halcomAddress{ReceiverAgent: compactBankValue(trimmedString(invoice.CustomerBIC)), ReceiverMailbox: compactBankValue(trimmedString(invoice.CustomerIBAN))}},
			Document:    halcomDocument{Type: "0002", Version: "01", ID: documentID, ExternalID: documentNumber, Timestamp: invoice.IssueDate.Format("2006-01-02T15:04:05")},
			Payment:     halcomPayment{Method: "0", Creditor: halcomPaymentParty{Name: halcomSenderName, Country: halcomSenderCountry, Address: []string{halcomSenderAddress, halcomSenderLocation}, Agent: sellerBIC, Account: sellerIBAN}, Debtor: halcomPaymentParty{Name: trimmedString(invoice.CustomerName), Country: country, Address: []string{trimmedString(invoice.CustomerAddress), location}, DAgent: compactBankValue(trimmedString(invoice.CustomerBIC)), DAccount: compactBankValue(trimmedString(invoice.CustomerIBAN))}, ExecutionDate: invoice.DueDate.Format("2006-01-02"), Amount: fmt.Sprintf("%.2f", amount), Currency: valueOrDefault(invoice.Currency, "EUR"), Remittance: halcomRemittance{Reference: "NRC", Information: "PLAČILO RAČUNA " + documentNumber}, Purpose: "CMDT"},
			Attachments: halcomAttachments{Count: 2, Items: []halcomAttachment{{Filename: xmlFilename, Type: "xml", Description: "E-dokument v XML e-SLOG formatu"}, {Filename: pdfFilename, Type: "pdf", Description: "E-dokument v PDF obliki"}}},
		},
	}
	contents, err := xml.MarshalIndent(document, "", "    ")
	if err != nil {
		return nil, fmt.Errorf("marshal Halcom envelope: %w", err)
	}
	return append([]byte(xml.Header), contents...), nil
}

func createHalcomZIP(files map[string][]byte) ([]byte, error) {
	var buffer bytes.Buffer
	archive := zip.NewWriter(&buffer)
	for _, name := range []string{"envelope.xml"} {
		if contents, exists := files[name]; exists {
			if err := writeZIPFile(archive, name, contents); err != nil {
				return nil, err
			}
		}
	}
	for name, contents := range files {
		if name != "envelope.xml" {
			if err := writeZIPFile(archive, name, contents); err != nil {
				return nil, err
			}
		}
	}
	if err := archive.Close(); err != nil {
		return nil, fmt.Errorf("close ZIP: %w", err)
	}
	return buffer.Bytes(), nil
}

func writeZIPFile(archive *zip.Writer, name string, contents []byte) error {
	file, err := archive.Create(name)
	if err != nil {
		return fmt.Errorf("create %s in ZIP: %w", name, err)
	}
	if _, err := io.Copy(file, bytes.NewReader(contents)); err != nil {
		return fmt.Errorf("write %s to ZIP: %w", name, err)
	}
	return nil
}
