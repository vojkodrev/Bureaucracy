package main

import (
	"context"
	"crypto"
	"crypto/md5"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"encoding/binary"
	"encoding/hex"
	"encoding/xml"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"bureaucracy/backend/furs"
	"bureaucracy/backend/lib"
	"github.com/beevik/etree"
	pkcs12legacy "github.com/gematik/zero-lab/go/pkcs12/legacy"
	"github.com/google/uuid"
	"github.com/hooklift/gowsdl/soap"
	dsig "github.com/russellhaering/goxmldsig"
)

const fursNamespace = "http://www.fu.gov.si/"

type FURSClient struct {
	config   *AppConfig
	requests *FURSSOAPRequestRepository
}

func NewFURSClient(config *AppConfig, requests *FURSSOAPRequestRepository) *FURSClient {
	return &FURSClient{config: config, requests: requests}
}

func (client *FURSClient) ConfirmInvoice(ctx context.Context, businessYearID int, invoice *Invoice, issuedAt time.Time) (string, string, error) {
	if err := validateInvoiceGrossTotal(invoice); err != nil {
		return "", "", err
	}
	privateKey, certificate, err := client.credentials()
	if err != nil {
		return "", "", err
	}
	if err := client.validateConfig(); err != nil {
		return "", "", err
	}
	fursInvoice := invoice
	if isFURSTestURL(client.config.FURSURL) {
		fursInvoice = anonymizedFURSInvoice(invoice)
	}
	amount := lib.RoundCurrency(float64OrZero(fursInvoice.Amount))
	fursInvoiceNumber := fursSequenceNumber(fursInvoice.InvoiceNumber)
	issueText := issuedAt.Format("02.01.2006 15:04:05")
	zoiInput := client.config.FURSTaxNumber + issueText + fursInvoiceNumber +
		client.config.FURSBusinessPremiseID + client.config.FURSElectronicDeviceID + fmt.Sprintf("%.2f", amount)
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, lib.SHA256Digest([]byte(zoiInput)))
	if err != nil {
		return "", "", fmt.Errorf("sign ZOI: %w", err)
	}
	zoiHash := md5.Sum(signature)
	zoi := hex.EncodeToString(zoiHash[:])

	typedRequest := buildFURSInvoiceRequest(client.config, fursInvoice, issuedAt, zoi)
	if err := validateFURSInvoiceTotal(fursInvoice, typedRequest); err != nil {
		return "", "", err
	}
	typedXML, err := xml.Marshal(typedRequest)
	if err != nil {
		return "", "", fmt.Errorf("marshal WSDL invoice request: %w", err)
	}
	requestDocument := etree.NewDocument()
	if err := requestDocument.ReadFromBytes(typedXML); err != nil {
		return "", "", fmt.Errorf("parse WSDL invoice request: %w", err)
	}
	requestElement := requestDocument.Root()
	prefixFURSRequest(requestElement)
	removeEmptyFURSInvoiceReferences(requestElement)
	signingContext, err := dsig.NewSigningContext(privateKey, [][]byte{certificate.Raw})
	if err != nil {
		return "", "", fmt.Errorf("create XML signing context: %w", err)
	}
	signingContext.IdAttribute = "Id"
	signingContext.Canonicalizer = dsig.MakeC14N10ExclusiveCanonicalizerWithPrefixList("")
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
	baseTransport := &http.Transport{TLSClientConfig: &tls.Config{
		MinVersion: tls.VersionTLS12, Certificates: []tls.Certificate{tlsCertificate},
	}}
	httpClient := &http.Client{Timeout: 30 * time.Second, Transport: &FURSPayloadTransport{
		base: baseTransport, requests: client.requests, businessYearID: businessYearID,
		invoiceID: invoice.ID, invoiceNumber: invoice.InvoiceNumber,
	}}
	soapClient := soap.NewClient(client.config.FURSURL,
		soap.WithHTTPClient(httpClient),
		soap.WithHTTPHeaders(map[string]string{"Accept": "text/xml"}),
	)
	response := &furs.InvoiceResponse{}
	if err := soapClient.CallContext(ctx, "/invoices", furs.RawXML(payload), response); err != nil {
		return "", "", fmt.Errorf("send invoice to FURS: %w", err)
	}
	if response.Error != nil {
		return "", "", fmt.Errorf("FURS rejected invoice: %s: %s", lib.StringOrEmpty(response.Error.ErrorCode), lib.StringOrEmpty(response.Error.ErrorMessage))
	}
	if response.UniqueInvoiceID == nil || strings.TrimSpace(string(*response.UniqueInvoiceID)) == "" {
		return "", "", fmt.Errorf("FURS response did not contain EOR")
	}
	return zoi, strings.TrimSpace(string(*response.UniqueInvoiceID)), nil
}

func removeEmptyFURSInvoiceReferences(requestElement *etree.Element) {
	for _, element := range requestElement.ChildElements() {
		if element.Tag == "Invoice" {
			for _, invoiceElement := range element.ChildElements() {
				isReference := invoiceElement.Tag == "ReferenceInvoice" || invoiceElement.Tag == "ReferenceSalesBook"
				if isReference && len(invoiceElement.ChildElements()) == 0 && strings.TrimSpace(invoiceElement.Text()) == "" {
					element.RemoveChild(invoiceElement)
				}
			}
		}
	}
}

func prefixFURSRequest(element *etree.Element) {
	prefixFURSElements(element)
	element.CreateAttr("xmlns:fu", fursNamespace)
}

func prefixFURSElements(element *etree.Element) {
	for _, child := range element.ChildElements() {
		prefixFURSElements(child)
	}
	element.Space = "fu"
	attributes := element.Attr[:0]
	for _, attribute := range element.Attr {
		if attribute.Key != "xmlns" && attribute.Space != "xmlns" {
			attributes = append(attributes, attribute)
		}
	}
	element.Attr = attributes
}

func (client *FURSClient) credentials() (*rsa.PrivateKey, *x509.Certificate, error) {
	if strings.TrimSpace(client.config.FURSCertificateFile) == "" {
		return nil, nil, fmt.Errorf("FURS_CERTIFICATE_FILE is required")
	}
	contents, err := os.ReadFile(client.config.FURSCertificateFile)
	if err != nil {
		return nil, nil, fmt.Errorf("read FURS certificate: %w", err)
	}
	bags, err := pkcs12legacy.Decode(contents, []byte(client.config.FURSCertificatePassword))
	if err != nil {
		return nil, nil, fmt.Errorf("decode FURS certificate: %w", err)
	}
	pairs := bags.FindMatchingPairs()
	if len(pairs) != 1 {
		return nil, nil, fmt.Errorf("FURS certificate must contain exactly one matching private key and certificate; found %d", len(pairs))
	}
	certificate, err := x509.ParseCertificate(pairs[0].Certificate.Raw)
	if err != nil {
		return nil, nil, fmt.Errorf("parse FURS certificate: %w", err)
	}
	key, err := x509.ParsePKCS8PrivateKey(pairs[0].PrivateKey.Raw)
	if err != nil {
		return nil, nil, fmt.Errorf("parse FURS private key: %w", err)
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
	amount := furs.AmountType(lib.RoundCurrency(float64OrZero(invoice.Amount)))
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
		rate := lib.RoundCurrency(*item.TaxRate)
		total := totals[rate]
		// NetAmount is the taxable amount reconstructed from the database's
		// rounded pre-discount amount. GrossAmount is the stored line total.
		// Deriving tax as their difference keeps every VAT group reconciled with
		// the invoice amount, including historical invoices.
		taxable := lib.RoundCurrency(float64OrZero(item.NetAmount))
		gross := lib.RoundCurrency(float64OrZero(item.GrossAmount))
		total.taxable += taxable
		total.tax += lib.RoundCurrency(gross - taxable)
		totals[rate] = total
	}
	rates := make([]float64, 0, len(totals))
	for rate := range totals {
		rates = append(rates, rate)
	}
	sort.Float64s(rates)
	for _, rate := range rates {
		total := totals[rate]
		taxRate := furs.TaxRateType(lib.RoundCurrency(rate))
		taxable := furs.TaxableAmountType(lib.RoundCurrency(total.taxable))
		tax := furs.TaxAmountType(lib.RoundCurrency(total.tax))
		taxes.VAT = append(taxes.VAT, &furs.VATType{TaxRate: &taxRate, TaxableAmount: &taxable, TaxAmount: &tax})
	}
	return &furs.InvoiceRequest{Id: "test", Header: &furs.HeaderType{MessageID: &messageID, DateTime: soap.CreateXsdDateTime(issuedAt, false)}, Invoice: &furs.InvoiceType{
		TaxNumber: &taxNumberType, IssueDateTime: soap.CreateXsdDateTime(issuedAt, false), NumberingStructure: &numbering,
		InvoiceIdentifier: &furs.IdentifierType{BusinessPremiseID: &premise, ElectronicDeviceID: &device, InvoiceNumber: fursSequenceNumber(invoice.InvoiceNumber)},
		CustomerVATNumber: customerVATNumber,
		InvoiceAmount:     &amount, PaymentAmount: &amount, TaxesPerSeller: taxes, OperatorTaxNumber: &operatorNumberType, ProtectedID: zoi,
	}}
}

func validateFURSInvoiceTotal(invoice *Invoice, request *furs.InvoiceRequest) error {
	if invoice == nil {
		return fmt.Errorf("cannot validate calculated FURS total without invoice input data")
	}
	invoiceNumber := invoice.InvoiceNumber
	if request == nil || request.Invoice == nil || request.Invoice.InvoiceAmount == nil {
		return fmt.Errorf("invoice %s has no calculated FURS total", invoiceNumber)
	}

	inputNetTotal := lib.CurrencyCents(float64OrZero(invoice.NetTotal))
	inputTotal := lib.CurrencyCents(float64OrZero(invoice.Amount))
	inputTaxTotal := inputTotal - inputNetTotal
	inputLineTotal := int64(0)
	for _, item := range invoice.Items {
		if item != nil {
			inputLineTotal += lib.CurrencyCents(float64OrZero(item.GrossAmount))
		}
	}
	requestTotal := lib.CurrencyCents(float64(*request.Invoice.InvoiceAmount))
	if requestTotal != inputTotal {
		return fmt.Errorf("invoice %s calculated FURS total %.2f does not match input total %.2f",
			invoiceNumber, float64(requestTotal)/100, float64(inputTotal)/100)
	}
	if request.Invoice.PaymentAmount == nil || lib.CurrencyCents(float64(*request.Invoice.PaymentAmount)) != inputTotal {
		return fmt.Errorf("invoice %s calculated FURS payment total does not match input total %.2f",
			invoiceNumber, float64(inputTotal)/100)
	}

	calculatedNetTotal := int64(0)
	calculatedTaxTotal := int64(0)
	if request.Invoice.TaxesPerSeller != nil {
		for _, vat := range request.Invoice.TaxesPerSeller.VAT {
			if vat == nil {
				continue
			}
			taxable := 0.0
			if vat.TaxableAmount != nil {
				taxable = float64(*vat.TaxableAmount)
			}
			tax := 0.0
			if vat.TaxAmount != nil {
				tax = float64(*vat.TaxAmount)
			}
			calculatedNetTotal += lib.CurrencyCents(taxable)
			calculatedTaxTotal += lib.CurrencyCents(tax)
		}
	}
	if calculatedNetTotal != inputNetTotal {
		return fmt.Errorf("invoice %s calculated FURS net total %.2f does not match input net total %.2f",
			invoiceNumber, float64(calculatedNetTotal)/100, float64(inputNetTotal)/100)
	}
	if calculatedTaxTotal != inputTaxTotal {
		return fmt.Errorf("invoice %s calculated FURS VAT total %.2f does not match input VAT total %.2f",
			invoiceNumber, float64(calculatedTaxTotal)/100, float64(inputTaxTotal)/100)
	}
	calculatedGrossTotal := calculatedNetTotal + calculatedTaxTotal
	if calculatedGrossTotal != inputLineTotal {
		return fmt.Errorf("invoice %s calculated FURS gross total %.2f does not match input line total %.2f",
			invoiceNumber, float64(calculatedGrossTotal)/100, float64(inputLineTotal)/100)
	}
	if requestTotal != calculatedGrossTotal {
		return fmt.Errorf("invoice %s calculated FURS total %.2f does not match net total %.2f plus VAT %.2f",
			invoiceNumber, float64(requestTotal)/100, float64(calculatedNetTotal)/100, float64(calculatedTaxTotal)/100)
	}
	return nil
}

func fursSequenceNumber(invoiceNumber string) string {
	value := strings.TrimLeft(strings.TrimSpace(invoiceNumber), "0")
	if value == "" {
		return "0"
	}
	return value
}

func isFURSTestURL(value string) bool {
	return strings.Contains(strings.ToLower(value), "test")
}

func anonymizedFURSInvoice(invoice *Invoice) *Invoice {
	digest := lib.SHA256Digest([]byte(fmt.Sprintf("%d:%s", invoice.ID, invoice.InvoiceNumber)))
	invoiceNumber := binary.BigEndian.Uint64(digest[:8])%9_000_000_000_000_000_000 + 1_000_000_000_000_000_000
	items := make([]*InvoiceItem, 0, len(invoice.Items))
	netTotal, amount := 0.0, 0.0
	for index, item := range invoice.Items {
		if item == nil {
			continue
		}
		itemDigest := lib.SHA256Digest([]byte(fmt.Sprintf("%d:%s:%d", invoice.ID, invoice.InvoiceNumber, index)))
		factor := 0.95 + float64(binary.BigEndian.Uint16(itemDigest[:2]))/65535*0.10
		netAmount := lib.RoundCurrency(float64OrZero(item.NetAmount) * factor)
		grossAmount := lib.RoundCurrency(float64OrZero(item.GrossAmount) * factor)
		netTotal += netAmount
		amount += grossAmount
		items = append(items, &InvoiceItem{
			TaxRate:     item.TaxRate,
			NetAmount:   &netAmount,
			GrossAmount: &grossAmount,
		})
	}
	netTotal = lib.RoundCurrency(netTotal)
	amount = lib.RoundCurrency(amount)
	return &Invoice{
		ID:            invoice.ID,
		InvoiceNumber: fmt.Sprintf("%d", invoiceNumber),
		NetTotal:      &netTotal,
		Amount:        &amount,
		Items:         items,
	}
}
