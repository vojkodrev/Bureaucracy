package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type InvoiceReminderHandler struct {
	invoices      *InvoiceRepository
	businessYears *BusinessYearRepository
	generator     *InvoiceReminderGenerator
}

func NewInvoiceReminderHandler(invoices *InvoiceRepository, businessYears *BusinessYearRepository, generator *InvoiceReminderGenerator) *InvoiceReminderHandler {
	return &InvoiceReminderHandler{invoices: invoices, businessYears: businessYears, generator: generator}
}

func (handler *InvoiceReminderHandler) Handle(context *gin.Context) {
	invoicePage, businessYear, ok := loadInvoiceReminderPage(context, handler.invoices, handler.businessYears)
	if !ok {
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), invoicePage, businessYear)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeInvoiceReportPDF(context, pdf, invoiceReminderFilename())
}

func loadInvoiceReminderPage(context *gin.Context, invoices *InvoiceRepository, businessYears *BusinessYearRepository) (*InvoicePage, int, bool) {
	if context.Query("resultsView") != "customer" ||
		(strings.TrimSpace(context.Query("customerId")) == "" && strings.TrimSpace(context.Query("customerName")) == "") {
		context.JSON(http.StatusBadRequest, gin.H{"error": "customer results view and customerId or customerName are required"})
		return nil, 0, false
	}

	query := context.Request.URL.Query()
	query.Set("paymentStatus", "overdue")
	query.Set("sortBy", "customer")
	query.Set("sortDirection", "asc")
	query.Set("page", "1")
	query.Set("pageSize", "10000")
	context.Request.URL.RawQuery = query.Encode()

	invoicePage, businessYear, _, _, ok := loadInvoiceReportPage(context, invoices, businessYears)
	if !ok {
		return nil, 0, false
	}
	if invoiceReminderCustomerCount(invoicePage.Invoices) != 1 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "reminders require exactly one matching customer"})
		return nil, 0, false
	}
	return invoicePage, businessYear, true
}

func invoiceReminderCustomerCount(invoices []*Invoice) int {
	customers := make(map[string]struct{})
	for _, invoice := range invoices {
		if invoice == nil {
			continue
		}
		key := strings.TrimSpace(trimmedString(invoice.CustomerCode))
		if key == "" {
			key = strings.TrimSpace(trimmedString(invoice.CustomerName))
		}
		customers[key] = struct{}{}
	}
	return len(customers)
}
