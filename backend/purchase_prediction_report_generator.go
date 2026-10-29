package main

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"
	"strconv"
	"time"
)

type purchasePredictionReportDocument struct {
	BusinessYear int
	GeneratedAt  string
	ResultPage   string
	Customers    []purchasePredictionReportCustomer
}

type purchasePredictionReportCustomer struct {
	Name string
	Rows []purchasePredictionReportRow
}

type purchasePredictionReportRow struct {
	ProductCode, ProductName, AverageFrequency, DaysSinceLast, Score7, Score14, Score30 string
}

//go:embed print/purchase-prediction-report/template.html
var purchasePredictionReportHTMLTemplate string

//go:embed print/purchase-prediction-report/template.css
var purchasePredictionReportCSSTemplate string

type PurchasePredictionReportGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewPurchasePredictionReportGenerator(pdfRenderer *HTMLPDFRenderer) (*PurchasePredictionReportGenerator, error) {
	tmpl, err := template.New("purchase-prediction-report").Parse(purchasePredictionReportHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse purchase prediction report template: %w", err)
	}
	return &PurchasePredictionReportGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *PurchasePredictionReportGenerator) Generate(ctx context.Context, page *PurchasePredictionPage, businessYear int) ([]byte, error) {
	if page == nil {
		return nil, fmt.Errorf("purchase prediction page is required")
	}
	customers := make([]purchasePredictionReportCustomer, 0)
	customerIndexes := make(map[string]int)
	for _, prediction := range page.Predictions {
		if prediction == nil {
			continue
		}
		index, exists := customerIndexes[prediction.CustomerCode]
		if !exists {
			index = len(customers)
			customerIndexes[prediction.CustomerCode] = index
			customers = append(customers, purchasePredictionReportCustomer{Name: invoiceCustomerReportName(&prediction.CustomerCode, prediction.CustomerName)})
		}
		average := "—"
		if prediction.AverageOrderFrequencyDays != nil {
			average = strconv.FormatFloat(*prediction.AverageOrderFrequencyDays, 'f', 1, 64)
		}
		customers[index].Rows = append(customers[index].Rows, purchasePredictionReportRow{
			ProductCode: prediction.ProductCode, ProductName: trimmedString(prediction.ProductName),
			AverageFrequency: average, DaysSinceLast: strconv.Itoa(prediction.DaysSinceLastOrder),
			Score7: formatPredictionPercent(prediction.Score7Days), Score14: formatPredictionPercent(prediction.Score14Days), Score30: formatPredictionPercent(prediction.Score30Days),
		})
	}
	document := purchasePredictionReportDocument{BusinessYear: businessYear, GeneratedAt: time.Now().Format("2.1.2006 15:04"), ResultPage: fmt.Sprintf("Stran rezultatov %d od %d", page.Page, page.TotalPages), Customers: customers}
	var rendered bytes.Buffer
	if err := generator.template.Execute(&rendered, struct {
		CSS      template.CSS
		Document purchasePredictionReportDocument
	}{template.CSS(purchasePredictionReportCSSTemplate), document}); err != nil {
		return nil, fmt.Errorf("render purchase prediction report HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, rendered.Bytes())
}

func formatPredictionPercent(value float64) string {
	return strconv.FormatFloat(value*100, 'f', 1, 64) + " %"
}
