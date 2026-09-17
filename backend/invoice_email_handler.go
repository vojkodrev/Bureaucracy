package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

type InvoiceEmailHandler struct {
	invoices      *InvoiceRepository
	customers     *CustomerRepository
	businessYears *BusinessYearRepository
	generator     *InvoicePrintGenerator
	sender        EmailSender
}

func NewInvoiceEmailHandler(invoices *InvoiceRepository, customers *CustomerRepository, businessYears *BusinessYearRepository, generator *InvoicePrintGenerator, sender EmailSender) *InvoiceEmailHandler {
	return &InvoiceEmailHandler{invoices: invoices, customers: customers, businessYears: businessYears, generator: generator, sender: sender}
}

func (handler *InvoiceEmailHandler) Send(context *gin.Context) {
	request, ok := parseDocumentEmailRequest(context)
	if !ok {
		return
	}
	invoice, customer, year, ok := handler.loadInvoice(context)
	if !ok {
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), invoice, year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate the invoice PDF"})
		return
	}
	storedRecipient := ""
	if customer != nil {
		storedRecipient = trimmedString(customer.Email)
	}
	sendDocumentEmail(context, handler.sender, request, invoicePDFFilename(invoice, year), pdf, storedRecipient)
}

func (handler *InvoiceEmailHandler) loadInvoice(context *gin.Context) (*Invoice, *Customer, int, bool) {
	invoiceNumber := strings.TrimSpace(context.Param("invoiceNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if invoiceNumber == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "a valid invoice number and business year are required"})
		return nil, nil, 0, false
	}
	year, err := handler.businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil || year == nil || year.Year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return nil, nil, 0, false
	}
	invoice, err := handler.invoices.GetByNumber(context.Request.Context(), businessYear, invoiceNumber)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load invoice"})
		return nil, nil, 0, false
	}
	if invoice == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
		return nil, nil, 0, false
	}
	var customer *Customer
	if customerCode := trimmedString(invoice.CustomerCode); customerCode != "" {
		customer, err = handler.customers.GetByID(context.Request.Context(), businessYear, customerCode)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load invoice customer"})
			return nil, nil, 0, false
		}
	}
	return invoice, customer, *year.Year, true
}
