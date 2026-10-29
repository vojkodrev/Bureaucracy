package main

import (
	"context"
	"crypto"
	"crypto/md5"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"bureaucracy/backend/furs"
	"github.com/beevik/etree"
	"github.com/google/uuid"
	"github.com/hooklift/gowsdl/soap"
	dsig "github.com/russellhaering/goxmldsig"
	"golang.org/x/crypto/pkcs12"
)

const fursNamespace = "http://www.fu.gov.si/"

type FURSClient struct{ config *AppConfig }

func NewFURSClient(config *AppConfig) *FURSClient { return &FURSClient{config: config} }

func (client *FURSClient) ConfirmInvoice(ctx context.Context, invoice *Invoice, issuedAt time.Time) (string, string, error) {
	privateKey, certificate, err := client.credentials()
	if err != nil {
		return "", "", err
	}
	if err := client.validateConfig(); err != nil {
		return "", "", err
	}
	amount := valueOrZero(invoice.Amount)
	fursInvoiceNumber := fursSequenceNumber(invoice.InvoiceNumber)
	issueText := issuedAt.Format("02.01.2006 15:04:05")
	zoiInput := client.config.FURSTaxNumber + issueText + fursInvoiceNumber +
		client.config.FURSBusinessPremiseID + client.config.FURSElectronicDeviceID + fmt.Sprintf("%.2f", amount)
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, sha256Digest([]byte(zoiInput)))
	if err != nil {
		return "", "", fmt.Errorf("sign ZOI: %w", err)
	}
	zoiHash := md5.Sum(signature)
	zoi := hex.EncodeToString(zoiHash[:])

	typedRequest := buildFURSInvoiceRequest(client.config, invoice, issuedAt, zoi)
	typedXML, err := xml.Marshal(typedRequest)
	if err != nil {
		return "", "", fmt.Errorf("marshal WSDL invoice request: %w", err)
	}
	requestDocument := etree.NewDocument()
	if err := requestDocument.ReadFromBytes(typedXML); err != nil {
		return "", "", fmt.Errorf("parse WSDL invoice request: %w", err)
	}
	requestElement := requestDocument.Root()
	signingContext, err := dsig.NewSigningContext(privateKey, [][]byte{certificate.Raw})
	if err != nil {
		return "", "", fmt.Errorf("create XML signing context: %w", err)
	}
	signingContext.IdAttribute = "Id"
	signingContext.Prefix = "ds"
	signedRequest, err := signingContext.SignEnveloped(requestElement)
	if err != nil {
		return "", "", fmt.Errorf("sign FURS XML: %w", err)
	}

	signedDocument := etree.NewDocument()
	signedDocument.SetRoot(signedRequest)
	payload, err := signedDocument.WriteToBytes()
	if err != nil {
		return "", "", fmt.Errorf("serialize FURS XML: %w", err)
	}

	tlsCertificate := tls.Certificate{Certificate: [][]byte{certificate.Raw}, PrivateKey: privateKey, Leaf: certificate}
	httpClient := &http.Client{Timeout: 30 * time.Second, Transport: &http.Transport{TLSClientConfig: &tls.Config{
		MinVersion: tls.VersionTLS12, Certificates: []tls.Certificate{tlsCertificate},
	}}}
	soapClient := soap.NewClient(client.config.FURSURL, soap.WithHTTPClient(httpClient))
	response := &furs.InvoiceResponse{}
	if err := soapClient.CallContext(ctx, "/invoices", rawXML{payload: payload}, response); err != nil {
		return "", "", fmt.Errorf("send invoice to FURS: %w", err)
	}
	if response.Error != nil {
		return "", "", fmt.Errorf("FURS rejected invoice: %s: %s", pointerText(response.Error.ErrorCode), pointerText(response.Error.ErrorMessage))
	}
	if response.UniqueInvoiceID == nil || strings.TrimSpace(string(*response.UniqueInvoiceID)) == "" {
		return "", "", fmt.Errorf("FURS response did not contain EOR")
	}
	return zoi, strings.TrimSpace(string(*response.UniqueInvoiceID)), nil
}

func (client *FURSClient) credentials() (*rsa.PrivateKey, *x509.Certificate, error) {
	if strings.TrimSpace(client.config.FURSCertificateFile) == "" {
		return nil, nil, fmt.Errorf("FURS_CERTIFICATE_FILE is required")
	}
	contents, err := os.ReadFile(client.config.FURSCertificateFile)
	if err != nil {
		return nil, nil, fmt.Errorf("read FURS certificate: %w", err)
	}
	key, certificate, err := pkcs12.Decode(contents, client.config.FURSCertificatePassword)
	if err != nil {
		return nil, nil, fmt.Errorf("decode FURS certificate: %w", err)
	}
	privateKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, nil, fmt.Errorf("FURS certificate must contain an RSA private key")
	}
	return privateKey, certificate, nil
}

func (client *FURSClient) validateConfig() error {
	values := map[string]string{"FURS_URL": client.config.FURSURL, "FURS_TAX_NUMBER": client.config.FURSTaxNumber,
		"FURS_OPERATOR_TAX_NUMBER": client.config.FURSOperatorTaxNumber, "FURS_BUSINESS_PREMISE_ID": client.config.FURSBusinessPremiseID,
		"FURS_ELECTRONIC_DEVICE_ID": client.config.FURSElectronicDeviceID}
	for key, value := range values {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%s is required", key)
		}
	}
	return nil
}

func buildFURSInvoiceRequest(config *AppConfig, invoice *Invoice, issuedAt time.Time, zoi string) *furs.InvoiceRequest {
	taxNumber := furs.PositiveInteger(config.FURSTaxNumber)
	taxNumberType := furs.TaxNumberType(&taxNumber)
	operatorNumber := furs.PositiveInteger(config.FURSOperatorTaxNumber)
	operatorNumberType := furs.TaxNumberType(&operatorNumber)
	premise := furs.BusinessPremiseIDType(config.FURSBusinessPremiseID)
	device := furs.ElectronicDeviceIDType(config.FURSElectronicDeviceID)
	numbering := furs.NumberingStructureTypeB
	amount := furs.AmountType(valueOrZero(invoice.Amount))
	messageID := furs.UUIDType(uuid.NewString())
	var customerVATNumber *furs.CustomerVATType
	if invoice.CustomerTaxID != nil && strings.TrimSpace(*invoice.CustomerTaxID) != "" {
		value := furs.CustomerVATType(strings.TrimSpace(*invoice.CustomerTaxID))
		customerVATNumber = &value
	}
	taxes := &furs.TaxesPerSellerType{}
	type vatTotal struct{ taxable, tax float64 }
	totals := map[float64]vatTotal{}
	for _, item := range invoice.Items {
		if item == nil || item.TaxRate == nil {
			continue
		}
		total := totals[*item.TaxRate]
		total.taxable += valueOrZero(item.NetAmount)
		total.tax += valueOrZero(item.GrossAmount) - valueOrZero(item.NetAmount)
		totals[*item.TaxRate] = total
	}
	rates := make([]float64, 0, len(totals))
	for rate := range totals {
		rates = append(rates, rate)
	}
	sort.Float64s(rates)
	for _, rate := range rates {
		total := totals[rate]
		taxRate := furs.TaxRateType(rate)
		taxable := furs.TaxableAmountType(total.taxable)
		tax := furs.TaxAmountType(total.tax)
		taxes.VAT = append(taxes.VAT, &furs.VATType{TaxRate: &taxRate, TaxableAmount: &taxable, TaxAmount: &tax})
	}
	return &furs.InvoiceRequest{Id: "test", Header: &furs.HeaderType{MessageID: &messageID, DateTime: soap.CreateXsdDateTime(issuedAt, false)}, Invoice: &furs.InvoiceType{
		TaxNumber: &taxNumberType, IssueDateTime: soap.CreateXsdDateTime(issuedAt, false), NumberingStructure: &numbering,
		InvoiceIdentifier: &furs.IdentifierType{BusinessPremiseID: &premise, ElectronicDeviceID: &device, InvoiceNumber: fursSequenceNumber(invoice.InvoiceNumber)},
		CustomerVATNumber: customerVATNumber,
		InvoiceAmount:     &amount, PaymentAmount: &amount, TaxesPerSeller: taxes, OperatorTaxNumber: &operatorNumberType, ProtectedID: zoi,
	}}
}

type rawXML struct{ payload []byte }

func (value rawXML) MarshalXML(encoder *xml.Encoder, _ xml.StartElement) error {
	decoder := xml.NewDecoder(strings.NewReader(string(value.payload)))
	for {
		token, err := decoder.Token()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}
		if err := encoder.EncodeToken(token); err != nil {
			return err
		}
	}
}

func pointerText[T ~string](value *T) string {
	if value == nil {
		return ""
	}
	return string(*value)
}

func fursSequenceNumber(invoiceNumber string) string {
	value := strings.TrimLeft(strings.TrimSpace(invoiceNumber), "0")
	if value == "" {
		return "0"
	}
	return value
}

func valueOrZero(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}

func sha256Digest(value []byte) []byte {
	hash := crypto.SHA256.New()
	_, _ = hash.Write(value)
	return hash.Sum(nil)
}
