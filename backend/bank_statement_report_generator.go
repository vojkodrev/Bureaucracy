package main

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"html/template"
	"strings"
	"time"
)

type bankStatementReportDocument struct {
	Title        string
	BusinessYear int
	DateRange    string
	GeneratedAt  string
	ResultPage   string
	Transactions []bankStatementReportRow
	Total        string
}

type bankStatementReportRow struct {
	Date               string
	OurReference       string
	CounterpartyName   string
	RecipientReference string
	Amount             string
}

//go:embed print/bank-statement-report/template.html
var bankStatementReportHTMLTemplate string

//go:embed print/bank-statement-report/template.css
var bankStatementReportCSSTemplate string

type BankStatementReportGenerator struct {
	template    *template.Template
	pdfRenderer *HTMLPDFRenderer
}

func NewBankStatementReportGenerator(pdfRenderer *HTMLPDFRenderer) (*BankStatementReportGenerator, error) {
	tmpl, err := template.New("bank-statement-report").Parse(bankStatementReportHTMLTemplate)
	if err != nil {
		return nil, fmt.Errorf("parse bank statement report print template: %w", err)
	}
	return &BankStatementReportGenerator{template: tmpl, pdfRenderer: pdfRenderer}, nil
}

func (generator *BankStatementReportGenerator) Generate(
	ctx context.Context,
	statementPage *BankStatementPage,
	businessYear int,
	dateFrom *time.Time,
	dateTo *time.Time,
) ([]byte, error) {
	if statementPage == nil {
		return nil, fmt.Errorf("bank statement page is required")
	}

	rows := make([]bankStatementReportRow, 0, len(statementPage.Entries))
	var total float64
	for _, entry := range statementPage.Entries {
		if entry == nil || entry.Outflow == nil || *entry.Outflow <= 0 {
			continue
		}
		rows = append(rows, bankStatementReportRow{
			Date:               formatDocumentDate(entry.PaymentDate),
			OurReference:       trimmedString(entry.EndToEndID),
			CounterpartyName:   trimmedString(entry.CustomerName),
			RecipientReference: trimmedString(entry.Reference),
			Amount:             formatMoneyAmount(*entry.Outflow),
		})
		total += *entry.Outflow
	}

	document := bankStatementReportDocument{
		Title:        "Odlivi po bančnih izpiskih",
		BusinessYear: businessYear,
		DateRange:    invoiceReportDateRange(dateFrom, dateTo),
		GeneratedAt:  time.Now().Format("2.1.2006 15:04"),
		ResultPage:   fmt.Sprintf("Stran rezultatov %d od %d", statementPage.Page, statementPage.TotalPages),
		Transactions: rows,
		Total:        formatMoneyAmount(total),
	}
	var renderedHTML bytes.Buffer
	if err := generator.template.Execute(&renderedHTML, struct {
		CSS      template.CSS
		Document bankStatementReportDocument
	}{CSS: template.CSS(bankStatementReportCSSTemplate), Document: document}); err != nil {
		return nil, fmt.Errorf("render bank statement report HTML: %w", err)
	}
	return generator.pdfRenderer.Render(ctx, renderedHTML.Bytes())
}

func bankStatementReportFilename(from *time.Time, to *time.Time) string {
	parts := []string{"odlivi"}
	if from != nil {
		parts = append(parts, from.Format("2006-01-02"))
	}
	if to != nil {
		parts = append(parts, to.Format("2006-01-02"))
	}
	return strings.Join(parts, "-") + ".pdf"
}
