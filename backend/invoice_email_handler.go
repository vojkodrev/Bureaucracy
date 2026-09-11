package main

import (
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	maxEmailRequestSize = 20 << 20
	maxAttachmentSize   = 5 << 20
	maxAttachments      = 5
)

var allowedAttachmentTypes = map[string]bool{
	"application/pdf": true, "image/jpeg": true, "image/png": true, "image/webp": true,
	"text/plain": true, "text/csv": true, "application/msword": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	"application/vnd.ms-excel": true,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
}

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
	context.Request.Body = http.MaxBytesReader(context.Writer, context.Request.Body, maxEmailRequestSize)
	if err := context.Request.ParseMultipartForm(maxEmailRequestSize); err != nil {
		context.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "email request must be at most 20 MiB"})
		return
	}
	recipient := strings.TrimSpace(context.PostForm("recipient"))
	subject := strings.TrimSpace(context.PostForm("subject"))
	message := strings.TrimSpace(context.PostForm("message"))
	if err := validateEmailFields(recipient, subject, message); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	invoice, customer, year, ok := handler.loadInvoice(context)
	if !ok {
		return
	}
	files := context.Request.MultipartForm.File["attachments"]
	if len(files) > maxAttachments {
		context.JSON(http.StatusBadRequest, gin.H{"error": "at most 5 additional attachments are allowed"})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), invoice, year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate the invoice PDF"})
		return
	}
	attachments := []EmailAttachment{{Filename: invoicePDFFilename(invoice, year), ContentType: "application/pdf", Data: pdf}}
	for _, fileHeader := range files {
		filename := safeUploadFilename(fileHeader.Filename)
		if fileHeader.Size > maxAttachmentSize {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q must be at most 5 MiB", filename)})
			return
		}
		contentType := strings.ToLower(strings.TrimSpace(strings.Split(fileHeader.Header.Get("Content-Type"), ";")[0]))
		if !allowedAttachmentTypes[contentType] {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q has an unsupported file type", filename)})
			return
		}
		file, err := fileHeader.Open()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "could not read an attachment"})
			return
		}
		data, readErr := io.ReadAll(io.LimitReader(file, maxAttachmentSize+1))
		file.Close()
		if readErr != nil || len(data) > maxAttachmentSize {
			context.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("attachment %q must be at most 5 MiB", filename)})
			return
		}
		attachments = append(attachments, EmailAttachment{Filename: filename, ContentType: contentType, Data: data})
	}
	if err := handler.sender.Send(context.Request.Context(), EmailMessage{To: recipient, Subject: subject, Body: message, Attachments: attachments}); err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"error": "the email could not be delivered; check the mail configuration and try again"})
		return
	}
	storedRecipient := ""
	if customer != nil {
		storedRecipient = stringValue(customer.Email)
	}
	context.JSON(http.StatusOK, gin.H{"sent": true, "recipientDiffers": emailRecipientsDiffer(storedRecipient, recipient)})
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
	if customerCode := stringValue(invoice.CustomerCode); customerCode != "" {
		customer, err = handler.customers.GetByID(context.Request.Context(), businessYear, customerCode)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load invoice customer"})
			return nil, nil, 0, false
		}
	}
	return invoice, customer, *year.Year, true
}

func validateEmailFields(recipient, subject, message string) error {
	if recipient == "" {
		return fmt.Errorf("recipient is required")
	}
	if hasHeaderInjection(recipient) || hasHeaderInjection(subject) {
		return fmt.Errorf("email fields contain invalid characters")
	}
	address, err := mail.ParseAddress(recipient)
	if err != nil || !strings.EqualFold(address.Address, recipient) {
		return fmt.Errorf("recipient must be a valid email address")
	}
	if subject == "" {
		return fmt.Errorf("subject is required")
	}
	if len([]rune(subject)) > 200 {
		return fmt.Errorf("subject must be at most 200 characters")
	}
	if message == "" {
		return fmt.Errorf("message is required")
	}
	if len([]rune(message)) > 10000 {
		return fmt.Errorf("message must be at most 10000 characters")
	}
	return nil
}

func emailRecipientsDiffer(stored, entered string) bool {
	stored = strings.TrimSpace(stored)
	return stored != "" && !strings.EqualFold(stored, strings.TrimSpace(entered))
}
