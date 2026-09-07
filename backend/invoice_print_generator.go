package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"html/template"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

type invoicePrintDocument struct {
	XMLName       xml.Name             `xml:"invoice"`
	InvoiceNumber string               `xml:"number"`
	Title         string               `xml:"title"`
	IssueDate     string               `xml:"issueDate"`
	DueDate       string               `xml:"dueDate"`
	ServiceDate   string               `xml:"serviceDate"`
	IssuePlace    string               `xml:"issuePlace"`
	Customer      invoicePrintCustomer `xml:"customer"`
	IntroText     string               `xml:"introText"`
	Items         []invoicePrintItem   `xml:"items>item"`
	NetTotal      string               `xml:"totals>net"`
	TaxTotal      string               `xml:"totals>tax"`
	GrossTotal    string               `xml:"totals>gross"`
	AmountInWords string               `xml:"amountInWords"`
	TaxSummaries  []invoicePrintTax    `xml:"taxes>tax"`
	ClosingText   string               `xml:"closingText"`
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

type InvoicePrintGenerator struct {
	template   *template.Template
	chromePath string
}

func NewInvoicePrintGenerator() (*InvoicePrintGenerator, error) {
	tmpl, err := template.New("invoice").Parse(htmlTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse invoice print template: %w", err)
	}
	return &InvoicePrintGenerator{
		template:   tmpl,
		chromePath: findChrome(),
	}, nil
}

func (generator *InvoicePrintGenerator) Generate(ctx context.Context, invoice *Invoice, businessYear int) ([]byte, error) {
	if invoice == nil {
		return nil, fmt.Errorf("invoice is required")
	}
	if generator.chromePath == "" {
		return nil, fmt.Errorf("Chrome is required to generate invoice PDFs; set CHROME_PATH")
	}

	displayNumber := fmt.Sprintf("%s/%d", invoice.InvoiceNumber, businessYear)
	printItems, taxSummaries := buildPrintItems(invoice.Items)
	netTotal := floatValue(invoice.GoodsAmount)
	grossTotal := floatValue(invoice.Amount)
	if invoice.GoodsAmount == nil {
		netTotal = sumInvoiceNet(invoice.Items)
	}
	if invoice.Amount == nil {
		grossTotal = sumInvoiceGross(invoice.Items)
	}

	xmlDocument, err := xml.Marshal(invoicePrintDocument{
		InvoiceNumber: displayNumber,
		Title:         "Drevi d.o.o. račun " + displayNumber,
		IssueDate:     formatPrintDate(invoice.IssueDate),
		DueDate:       formatPrintDate(invoice.DueDate),
		ServiceDate:   formatPrintDate(invoice.ServiceDate),
		IssuePlace:    valueOrDefault(invoice.IssuePlace, "1000 Ljubljana"),
		Customer: invoicePrintCustomer{
			Name:     stringValue(invoice.CustomerName),
			Address:  stringValue(invoice.CustomerAddress),
			Location: customerLocation(invoice.CustomerPostalCode, invoice.CustomerCity),
			TaxID:    stringValue(invoice.CustomerTaxID),
		},
		IntroText:     stringValue(invoice.IntroductoryText),
		Items:         printItems,
		NetTotal:      formatMoney(netTotal),
		TaxTotal:      formatMoney(grossTotal - netTotal),
		GrossTotal:    formatMoney(grossTotal),
		AmountInWords: amountInWords(grossTotal),
		TaxSummaries:  taxSummaries,
		ClosingText:   strings.ReplaceAll(stringValue(invoice.ClosingText), "#ŠTEVILKA#", displayNumber),
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
		CSS      template.CSS
		Document invoicePrintDocument
		Logo     template.URL
	}{
		CSS:      template.CSS(cssTemplate),
		Document: printDocument,
		Logo:     template.URL("data:image/webp;base64," + base64.StdEncoding.EncodeToString(logo)),
	}); err != nil {
		return nil, fmt.Errorf("render invoice HTML: %w", err)
	}

	return generator.htmlToPDF(ctx, renderedHTML.Bytes())
}

func formatPrintDate(value *time.Time) string {
	if value == nil {
		return ""
	}
	return value.Format("2.1.2006")
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.TrimSpace(*value)
}

func valueOrDefault(value *string, fallback string) string {
	if result := stringValue(value); result != "" {
		return result
	}
	return fallback
}

func customerLocation(postalCode *string, city *string) string {
	postal := stringValue(postalCode)
	location := stringValue(city)
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
		quantity := floatValue(item.Quantity)
		netAmount := floatValue(item.NetAmount)
		grossAmount := floatValue(item.GrossAmount)
		discount := floatValue(item.Discount)
		discountedUnitPrice := divide(netAmount, quantity)
		originalNetAmount := netAmount
		if discount > 0 && discount < 100 {
			originalNetAmount = netAmount / (1 - discount/100)
		}
		rate := floatValue(item.TaxRate)
		group := taxGroups[rate]
		taxGroups[rate] = [2]float64{group[0] + netAmount, group[1] + grossAmount - netAmount}

		sequence := index + 1
		if item.Sequence != nil {
			sequence = *item.Sequence
		}
		printItems = append(printItems, invoicePrintItem{
			Sequence:         fmt.Sprintf("%d", sequence),
			Description:      strings.TrimSpace(stringValue(item.ProductName)),
			Quantity:         formatQuantity(quantity),
			Unit:             stringValue(item.Unit),
			UnitPrice:        formatMoney(divide(originalNetAmount, quantity)),
			Discount:         formatPercent(discount),
			DiscountAmount:   formatMoney(originalNetAmount - netAmount),
			DiscountedPrice:  formatMoney(discountedUnitPrice),
			TaxRate:          formatPercent(rate),
			UnitPriceWithTax: formatMoney(divide(grossAmount, quantity)),
			NetAmount:        formatMoney(netAmount),
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
			Description: "DDV " + formatPercent(rate),
			Rate:        formatMoney(rate),
			NetAmount:   formatMoney(amounts[0]),
			TaxAmount:   formatMoney(amounts[1]),
		})
	}
	return printItems, taxes
}

func sumInvoiceNet(items []*InvoiceItem) float64 {
	var total float64
	for _, item := range items {
		if item != nil {
			total += floatValue(item.NetAmount)
		}
	}
	return total
}

func sumInvoiceGross(items []*InvoiceItem) float64 {
	var total float64
	for _, item := range items {
		if item != nil {
			total += floatValue(item.GrossAmount)
		}
	}
	return total
}

func floatValue(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}

func divide(value float64, divisor float64) float64 {
	if divisor == 0 {
		return 0
	}
	return value / divisor
}

func formatMoney(value float64) string {
	return strings.Replace(fmt.Sprintf("%.2f", value), ".", ",", 1)
}

func formatQuantity(value float64) string {
	if value == float64(int64(value)) {
		return fmt.Sprintf("%d", int64(value))
	}
	return strings.TrimRight(strings.TrimRight(strings.Replace(fmt.Sprintf("%.3f", value), ".", ",", 1), "0"), ",")
}

func formatPercent(value float64) string {
	return formatQuantity(value) + " %"
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

func (generator *InvoicePrintGenerator) htmlToPDF(ctx context.Context, htmlDocument []byte) ([]byte, error) {
	temporaryDirectory, err := os.MkdirTemp("", "bureaucracy-invoice-print-*")
	if err != nil {
		return nil, fmt.Errorf("create invoice print directory: %w", err)
	}
	defer os.RemoveAll(temporaryDirectory)

	htmlPath := filepath.Join(temporaryDirectory, "invoice.html")
	if err := os.WriteFile(htmlPath, htmlDocument, 0o600); err != nil {
		return nil, fmt.Errorf("write invoice HTML: %w", err)
	}

	allocatorOptions := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.ExecPath(generator.chromePath),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.UserDataDir(filepath.Join(temporaryDirectory, "chrome-profile")),
	)
	allocatorContext, cancelAllocator := chromedp.NewExecAllocator(ctx, allocatorOptions...)
	defer cancelAllocator()
	browserContext, cancelBrowser := chromedp.NewContext(allocatorContext)
	defer cancelBrowser()
	browserContext, cancelTimeout := context.WithTimeout(browserContext, 30*time.Second)
	defer cancelTimeout()

	var pdf []byte
	documentURL := (&url.URL{Scheme: "file", Path: htmlPath}).String()
	if err := chromedp.Run(browserContext,
		chromedp.Navigate(documentURL),
		chromedp.WaitReady("body"),
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			pdf, _, err = page.PrintToPDF().
				WithPrintBackground(true).
				WithPreferCSSPageSize(true).
				Do(ctx)
			return err
		}),
	); err != nil {
		return nil, fmt.Errorf("generate invoice PDF: %w", err)
	}
	if !bytes.HasPrefix(pdf, []byte("%PDF-")) {
		return nil, fmt.Errorf("Chrome returned an invalid invoice PDF")
	}
	return pdf, nil
}

func findChrome() string {
	if configuredPath := strings.TrimSpace(os.Getenv("CHROME_PATH")); configuredPath != "" {
		return configuredPath
	}

	for _, name := range []string{
		"google-chrome",
		"google-chrome-stable",
		"chrome",
		"chromium",
		"chromium-browser",
		"microsoft-edge",
		"msedge",
		"brave-browser",
		"brave",
	} {
		if path, err := exec.LookPath(name); err == nil {
			return path
		}
	}
	for _, path := range chromeInstallPaths() {
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			return path
		}
	}
	return ""
}

func chromeInstallPaths() []string {
	switch runtime.GOOS {
	case "darwin":
		return []string{
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/Applications/Chromium.app/Contents/MacOS/Chromium",
			"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
			"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
		}
	case "windows":
		var paths []string
		for _, baseDirectory := range []string{
			os.Getenv("LOCALAPPDATA"),
			os.Getenv("ProgramFiles"),
			os.Getenv("ProgramFiles(x86)"),
		} {
			if baseDirectory == "" {
				continue
			}
			paths = append(paths,
				filepath.Join(baseDirectory, "Google", "Chrome", "Application", "chrome.exe"),
				filepath.Join(baseDirectory, "Chromium", "Application", "chrome.exe"),
				filepath.Join(baseDirectory, "Microsoft", "Edge", "Application", "msedge.exe"),
				filepath.Join(baseDirectory, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
			)
		}
		return paths
	default:
		return []string{
			"/usr/bin/google-chrome",
			"/usr/bin/google-chrome-stable",
			"/usr/bin/chromium",
			"/usr/bin/chromium-browser",
			"/usr/bin/microsoft-edge",
			"/usr/bin/brave-browser",
			"/snap/bin/chromium",
		}
	}
}
