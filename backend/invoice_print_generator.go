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
	"strings"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
)

type invoicePrintDocument struct {
	XMLName       xml.Name             `xml:"invoice"`
	InvoiceNumber string               `xml:"number"`
	IssueDate     string               `xml:"issueDate"`
	DueDate       string               `xml:"dueDate"`
	ServiceDate   string               `xml:"serviceDate"`
	IssuePlace    string               `xml:"issuePlace"`
	Customer      invoicePrintCustomer `xml:"customer"`
}

type invoicePrintCustomer struct {
	Name     string `xml:"name"`
	Address  string `xml:"address"`
	Location string `xml:"location"`
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

func (generator *InvoicePrintGenerator) Generate(ctx context.Context, invoice *Invoice) ([]byte, error) {
	if invoice == nil {
		return nil, fmt.Errorf("invoice is required")
	}
	if generator.chromePath == "" {
		return nil, fmt.Errorf("Chrome is required to generate invoice PDFs; set CHROME_PATH")
	}

	xmlDocument, err := xml.Marshal(invoicePrintDocument{
		InvoiceNumber: invoice.InvoiceNumber,
		IssueDate:     formatPrintDate(invoice.IssueDate),
		DueDate:       formatPrintDate(invoice.DueDate),
		ServiceDate:   formatPrintDate(invoice.ServiceDate),
		IssuePlace:    valueOrDefault(invoice.IssuePlace, "1000 Ljubljana"),
		Customer: invoicePrintCustomer{
			Name:     stringValue(invoice.CustomerName),
			Address:  stringValue(invoice.CustomerAddress),
			Location: customerLocation(invoice.CustomerPostalCode, invoice.CustomerCity),
		},
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
