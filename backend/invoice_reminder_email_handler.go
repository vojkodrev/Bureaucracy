package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type InvoiceReminderEmailHandler struct {
	invoices      *InvoiceRepository
	customers     *CustomerRepository
	businessYears *BusinessYearRepository
	generator     *InvoiceReminderGenerator
	sender        EmailSender
}

func NewInvoiceReminderEmailHandler(invoices *InvoiceRepository, customers *CustomerRepository, businessYears *BusinessYearRepository, generator *InvoiceReminderGenerator, sender EmailSender) *InvoiceReminderEmailHandler {
	return &InvoiceReminderEmailHandler{invoices: invoices, customers: customers, businessYears: businessYears, generator: generator, sender: sender}
}

func (handler *InvoiceReminderEmailHandler) Send(context *gin.Context) {
	request, ok := parseDocumentEmailRequest(context)
	if !ok {
		return
	}
	invoicePage, businessYear, ok := loadInvoiceReminderPage(context, handler.invoices, handler.businessYears)
	if !ok {
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), invoicePage, businessYear)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate the reminders PDF"})
		return
	}
	storedRecipient := ""
	if customerCode := reminderCustomerCode(invoicePage.Invoices); customerCode != "" {
		customer, customerErr := handler.customers.GetByID(context.Request.Context(), strings.TrimSpace(context.Query("businessYear")), customerCode)
		if customerErr != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load reminder customer"})
			return
		}
		if customer != nil {
			storedRecipient = trimmedString(customer.Email)
		}
	}
	sendDocumentEmail(context, handler.sender, request, invoiceReminderFilename(), pdf, storedRecipient)
}

func reminderCustomerCode(invoices []*Invoice) string {
	for _, invoice := range invoices {
		if invoice != nil && strings.TrimSpace(trimmedString(invoice.CustomerCode)) != "" {
			return strings.TrimSpace(trimmedString(invoice.CustomerCode))
		}
	}
	return ""
}
