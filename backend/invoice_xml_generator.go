package main

import (
	"encoding/xml"
	"fmt"
	"sort"
	"strings"
)

const (
	eslogNamespace = "urn:eslog:2.00"
	sellerIBAN     = "SI56040000278805004"
	sellerBIC      = "KBMASI2XXXX"
)

type eslogDocument struct {
	XMLName        xml.Name     `xml:"Invoice"`
	Namespace      string       `xml:"xmlns,attr"`
	XSINamespace   string       `xml:"xmlns:xsi,attr"`
	SchemaLocation string       `xml:"xsi:schemaLocation,attr"`
	Invoice        eslogInvoice `xml:"M_INVOIC"`
}

type eslogInvoice struct {
	Header       eslogHeader           `xml:"S_UNH"`
	Beginning    eslogBeginning        `xml:"S_BGM"`
	Dates        []eslogDate           `xml:"S_DTM"`
	Texts        []eslogText           `xml:"S_FTX"`
	References   []eslogReferenceGroup `xml:"G_SG1"`
	Parties      []eslogParty          `xml:"G_SG2"`
	Currency     eslogCurrencyGroup    `xml:"G_SG7"`
	Payment      *eslogPaymentGroup    `xml:"G_SG8,omitempty"`
	Lines        []eslogLine           `xml:"G_SG26"`
	Totals       []eslogAmountGroup    `xml:"G_SG50"`
	TaxSummaries []eslogTaxGroup       `xml:"G_SG52"`
}

type eslogHeader struct {
	Number      string `xml:"D_0062"`
	MessageType string `xml:"C_S009>D_0065"`
	Directory   string `xml:"C_S009>D_0052"`
	Release     string `xml:"C_S009>D_0054"`
	Agency      string `xml:"C_S009>D_0051"`
}

type eslogBeginning struct {
	DocumentCode   string `xml:"C_C002>D_1001"`
	DocumentNumber string `xml:"C_C106>D_1004"`
}

type eslogDate struct {
	Qualifier string `xml:"C_C507>D_2005"`
	Value     string `xml:"C_C507>D_2380"`
}

type eslogText struct {
	Subject string `xml:"D_4451"`
	Text    string `xml:"C_C108>D_4440"`
}

type eslogReferenceGroup struct {
	Reference eslogReference `xml:"S_RFF"`
}

type eslogReference struct {
	Qualifier string `xml:"C_C506>D_1153"`
	Value     string `xml:"C_C506>D_1154"`
}

type eslogParty struct {
	Name       eslogPartyName        `xml:"S_NAD"`
	Financial  *eslogFinancial       `xml:"S_FII,omitempty"`
	References []eslogReferenceGroup `xml:"G_SG3"`
}

type eslogPartyName struct {
	Role        string `xml:"D_3035"`
	Name        string `xml:"C_C080>D_3036"`
	Address     string `xml:"C_C059>D_3042"`
	City        string `xml:"D_3164"`
	CountryName string `xml:"C_C819>D_3228"`
	PostalCode  string `xml:"D_3251"`
	CountryCode string `xml:"D_3207"`
}

type eslogFinancial struct {
	Role string `xml:"D_3035"`
	IBAN string `xml:"C_C078>D_3194"`
	BIC  string `xml:"C_C088>D_3433"`
}

type eslogCurrencyGroup struct {
	Currency eslogCurrency `xml:"S_CUX"`
}
type eslogCurrency struct {
	Qualifier string `xml:"C_C504>D_6347"`
	Code      string `xml:"C_C504>D_6345"`
}
type eslogPaymentGroup struct {
	Terms eslogPaymentTerms `xml:"S_PAT"`
	Date  eslogDate         `xml:"S_DTM"`
}
type eslogPaymentTerms struct {
	Code string `xml:"D_4279"`
}

type eslogLine struct {
	Line        eslogLineNumber      `xml:"S_LIN"`
	Product     *eslogProduct        `xml:"S_PIA,omitempty"`
	Description eslogDescription     `xml:"S_IMD"`
	Quantity    eslogQuantity        `xml:"S_QTY"`
	Amounts     []eslogAmountGroup   `xml:"G_SG27"`
	Price       eslogPriceGroup      `xml:"G_SG29"`
	Reference   *eslogReferenceGroup `xml:"G_SG30,omitempty"`
	Tax         eslogTaxGroup        `xml:"G_SG34"`
}
type eslogLineNumber struct {
	Value string `xml:"D_1082"`
}
type eslogProduct struct {
	Function string `xml:"D_4347"`
	Code     string `xml:"C_C212>D_7140"`
	CodeType string `xml:"C_C212>D_7143"`
}
type eslogDescription struct {
	Format string `xml:"D_7077"`
	Text   string `xml:"C_C273>D_7008"`
}
type eslogQuantity struct {
	Qualifier string `xml:"C_C186>D_6063"`
	Value     string `xml:"C_C186>D_6060"`
	Unit      string `xml:"C_C186>D_6411"`
}
type eslogAmountGroup struct {
	Amount eslogAmount `xml:"S_MOA"`
}
type eslogAmount struct {
	Qualifier string `xml:"C_C516>D_5025"`
	Value     string `xml:"C_C516>D_5004"`
}
type eslogPriceGroup struct {
	Price eslogPrice `xml:"S_PRI"`
}
type eslogPrice struct {
	Qualifier string `xml:"C_C509>D_5125"`
	Value     string `xml:"C_C509>D_5118"`
}
type eslogTaxGroup struct {
	Tax     eslogTax      `xml:"S_TAX"`
	Amounts []eslogAmount `xml:"S_MOA"`
}
type eslogTax struct {
	Function string `xml:"D_5283"`
	Type     string `xml:"C_C241>D_5153"`
	Rate     string `xml:"C_C243>D_5278"`
	Category string `xml:"D_5305"`
}

type InvoiceXMLGenerator struct{}

func NewInvoiceXMLGenerator() *InvoiceXMLGenerator { return &InvoiceXMLGenerator{} }

func (generator *InvoiceXMLGenerator) Generate(invoice *Invoice, businessYear int) ([]byte, error) {
	if invoice == nil {
		return nil, fmt.Errorf("invoice is required")
	}
	if invoice.IssueDate == nil {
		return nil, fmt.Errorf("invoice issue date is required")
	}
	if strings.TrimSpace(invoice.InvoiceNumber) == "" {
		return nil, fmt.Errorf("invoice number is required")
	}

	number := fmt.Sprintf("%s-%d", strings.TrimSpace(invoice.InvoiceNumber), businessYear)
	net, gross := float64OrZero(invoice.GoodsAmount), float64OrZero(invoice.Amount)
	if invoice.GoodsAmount == nil {
		net = sumInvoiceNet(invoice.Items)
	}
	if invoice.Amount == nil {
		gross = sumInvoiceGross(invoice.Items)
	}

	document := eslogDocument{
		Namespace: eslogNamespace, XSINamespace: "http://www.w3.org/2001/XMLSchema-instance",
		SchemaLocation: eslogNamespace + " eSLOG20_INVOIC_v200.xsd",
		Invoice: eslogInvoice{
			Header:    eslogHeader{Number: number, MessageType: "INVOIC", Directory: "D", Release: "01B", Agency: "UN"},
			Beginning: eslogBeginning{DocumentCode: "380", DocumentNumber: number},
			Dates:     []eslogDate{{Qualifier: "137", Value: invoice.IssueDate.Format("2006-01-02")}},
			Texts:     []eslogText{{Subject: "DOC", Text: "urn:cen.eu:en16931:2017"}, {Subject: "PMD", Text: "PLAČILO RAČUNA " + number}},
			Parties: []eslogParty{
				newEslogParty("SE", "DREVI D.O.O.", "OB ŽELEZNICI 16", "1000", "LJUBLJANA", "SLOVENIJA", sellerIBAN, sellerBIC, "5314518000", "SI35954086"),
				newEslogParty("BY", trimmedString(invoice.CustomerName), trimmedString(invoice.CustomerAddress), trimmedString(invoice.CustomerPostalCode), trimmedString(invoice.CustomerCity), valueOrDefault(invoice.CustomerCountry, "SLOVENIJA"), trimmedString(invoice.CustomerIBAN), trimmedString(invoice.CustomerBIC), trimmedString(invoice.CustomerRegistrationNumber), trimmedString(invoice.CustomerTaxID)),
			},
			Currency: eslogCurrencyGroup{Currency: eslogCurrency{Qualifier: "2", Code: valueOrDefault(invoice.Currency, "EUR")}},
		},
	}
	if invoice.ServiceDate != nil {
		document.Invoice.Dates = append(document.Invoice.Dates, eslogDate{Qualifier: "35", Value: invoice.ServiceDate.Format("2006-01-02")})
	}
	if text := trimmedString(invoice.IntroductoryText); text != "" {
		document.Invoice.Texts = append(document.Invoice.Texts, eslogText{Subject: "AAI", Text: text})
	}
	if text := trimmedString(invoice.ClosingText); text != "" {
		document.Invoice.Texts = append(document.Invoice.Texts, eslogText{Subject: "REG", Text: strings.ReplaceAll(text, "#ŠTEVILKA#", number)})
	}
	for _, reference := range []eslogReference{{Qualifier: "AAK", Value: trimmedString(invoice.DeliveryNoteNumber)}, {Qualifier: "ON", Value: trimmedString(invoice.PurchaseOrderNumber)}, {Qualifier: "PQ", Value: "SI" + number}} {
		if reference.Value != "" {
			document.Invoice.References = append(document.Invoice.References, eslogReferenceGroup{Reference: reference})
		}
	}
	if invoice.DueDate != nil {
		document.Invoice.Payment = &eslogPaymentGroup{Terms: eslogPaymentTerms{Code: "1"}, Date: eslogDate{Qualifier: "13", Value: invoice.DueDate.Format("2006-01-02")}}
	}

	taxGroups := make(map[float64][2]float64)
	for index, item := range invoice.Items {
		if item == nil {
			continue
		}
		quantity, itemNet, itemGross, rate := float64OrZero(item.Quantity), float64OrZero(item.NetAmount), float64OrZero(item.GrossAmount), float64OrZero(item.TaxRate)
		group := taxGroups[rate]
		taxGroups[rate] = [2]float64{group[0] + itemNet, group[1] + itemGross - itemNet}
		line := eslogLine{
			Line: eslogLineNumber{Value: fmt.Sprintf("%d", index+1)}, Description: eslogDescription{Format: "F", Text: trimmedString(item.ProductName)},
			Quantity: eslogQuantity{Qualifier: "47", Value: fmt.Sprintf("%.2f", quantity), Unit: unitCode(item.Unit)},
			Amounts:  []eslogAmountGroup{newEslogAmountGroup("203", itemNet), newEslogAmountGroup("38", itemGross)},
			Price:    eslogPriceGroup{Price: eslogPrice{Qualifier: "AAA", Value: fmt.Sprintf("%.4f", divide(itemNet, quantity))}},
			Tax:      newEslogTaxGroup(rate, itemNet, itemGross-itemNet),
		}
		if code := trimmedString(item.ProductCode); code != "" {
			line.Product = &eslogProduct{Function: "5", Code: code, CodeType: "SA"}
		}
		if delivery := trimmedString(invoice.DeliveryNoteNumber); delivery != "" {
			line.Reference = &eslogReferenceGroup{Reference: eslogReference{Qualifier: "AAK", Value: delivery}}
		}
		document.Invoice.Lines = append(document.Invoice.Lines, line)
	}
	for _, total := range []struct {
		qualifier string
		amount    float64
	}{{"9", gross}, {"388", gross}, {"389", net}, {"176", gross - net}, {"260", 0}, {"79", net}} {
		document.Invoice.Totals = append(document.Invoice.Totals, newEslogAmountGroup(total.qualifier, total.amount))
	}
	rates := make([]float64, 0, len(taxGroups))
	for rate := range taxGroups {
		rates = append(rates, rate)
	}
	sort.Float64s(rates)
	for _, rate := range rates {
		amounts := taxGroups[rate]
		document.Invoice.TaxSummaries = append(document.Invoice.TaxSummaries, newEslogTaxGroup(rate, amounts[0], amounts[1]))
	}

	contents, err := xml.MarshalIndent(document, "", "    ")
	if err != nil {
		return nil, fmt.Errorf("marshal invoice XML: %w", err)
	}
	prefix := xml.Header + `<?xml-stylesheet type="text/xsl" href="http://vizualiziraj.si/eInvoiceVizualization_2.0_24042020.xslt"?>` + "\n"
	return append([]byte(prefix), contents...), nil
}

func newEslogParty(role, name, address, postal, city, country, iban, bic, registration, taxID string) eslogParty {
	party := eslogParty{Name: eslogPartyName{Role: role, Name: name, Address: address, City: city, CountryName: country, PostalCode: postal, CountryCode: countryCode(country)}}
	if iban != "" || bic != "" {
		financialRole := "BB"
		if role == "SE" {
			financialRole = "RB"
		}
		party.Financial = &eslogFinancial{Role: financialRole, IBAN: compactBankValue(iban), BIC: compactBankValue(bic)}
	}
	for _, reference := range []eslogReference{{Qualifier: "0199", Value: registration}, {Qualifier: "VA", Value: taxID}, {Qualifier: "AHP", Value: taxID}} {
		if reference.Value != "" {
			party.References = append(party.References, eslogReferenceGroup{Reference: reference})
		}
	}
	return party
}

func newEslogAmountGroup(qualifier string, amount float64) eslogAmountGroup {
	return eslogAmountGroup{Amount: eslogAmount{Qualifier: qualifier, Value: fmt.Sprintf("%.4f", amount)}}
}

func newEslogTaxGroup(rate, net, tax float64) eslogTaxGroup {
	category := "S"
	if rate == 0 {
		category = "Z"
	}
	return eslogTaxGroup{Tax: eslogTax{Function: "7", Type: "VAT", Rate: fmt.Sprintf("%g", rate), Category: category}, Amounts: []eslogAmount{{Qualifier: "125", Value: fmt.Sprintf("%.4f", net)}, {Qualifier: "124", Value: fmt.Sprintf("%.4f", tax)}}}
}

func compactBankValue(value string) string {
	return strings.NewReplacer(" ", "", "-", "").Replace(strings.TrimSpace(value))
}
func countryCode(country string) string {
	if strings.EqualFold(strings.TrimSpace(country), "SLOVENIJA") || strings.EqualFold(strings.TrimSpace(country), "SLO") {
		return "SI"
	}
	return strings.ToUpper(strings.TrimSpace(country))
}
func unitCode(unit *string) string {
	switch strings.ToUpper(strings.TrimSpace(trimmedString(unit))) {
	case "KOS", "KOM", "PCS", "C62", "":
		return "C62"
	case "URA", "H":
		return "HUR"
	default:
		return strings.ToUpper(strings.TrimSpace(trimmedString(unit)))
	}
}
