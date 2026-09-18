package main

import (
	"mime"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type InvoiceReportHandler struct {
	invoices          *InvoiceRepository
	businessYears     *BusinessYearRepository
	generator         *InvoiceReportGenerator
	customerGenerator *InvoiceCustomerReportGenerator
}

func NewInvoiceReportHandler(invoices *InvoiceRepository, businessYears *BusinessYearRepository, generator *InvoiceReportGenerator, customerGenerator *InvoiceCustomerReportGenerator) *InvoiceReportHandler {
	return &InvoiceReportHandler{invoices: invoices, businessYears: businessYears, generator: generator, customerGenerator: customerGenerator}
}

func (handler *InvoiceReportHandler) Handle(context *gin.Context) {
	invoicePage, businessYear, issuedFrom, issuedTo, ok := loadInvoiceReportPage(context, handler.invoices, handler.businessYears)
	if !ok {
		return
	}
	var pdf []byte
	var err error
	filename := invoiceReportFilename(issuedFrom, issuedTo)
	if context.Query("resultsView") == "customer" {
		summaryPage := summarizeInvoicesByCustomer(invoicePage, time.Now())
		pdf, err = handler.customerGenerator.Generate(context.Request.Context(), summaryPage, businessYear, issuedFrom, issuedTo)
		filename = invoiceCustomerReportFilename(issuedFrom, issuedTo)
	} else {
		pdf, err = handler.generator.Generate(context.Request.Context(), invoicePage, businessYear, issuedFrom, issuedTo)
	}
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	writeInvoiceReportPDF(context, pdf, filename)
}

func loadInvoiceReportPage(context *gin.Context, invoices *InvoiceRepository, businessYears *BusinessYearRepository) (*InvoicePage, int, *time.Time, *time.Time, bool) {
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if businessYear == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
		return nil, 0, nil, nil, false
	}
	issuedFrom, err := optionalReportDate(context.Query("from"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "from must be a date in YYYY-MM-DD format"})
		return nil, 0, nil, nil, false
	}
	issuedTo, err := optionalReportDate(context.Query("to"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "to must be a date in YYYY-MM-DD format"})
		return nil, 0, nil, nil, false
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "from must not be after to"})
		return nil, 0, nil, nil, false
	}
	page, err := reportPositiveInteger(context.Query("page"), 1)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "page must be a positive integer"})
		return nil, 0, nil, nil, false
	}
	pageSize, err := reportPositiveInteger(context.Query("pageSize"), 20)
	if err != nil || pageSize > 10000 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "pageSize must be between 1 and 10000"})
		return nil, 0, nil, nil, false
	}
	year, err := businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return nil, 0, nil, nil, false
	}
	if year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return nil, 0, nil, nil, false
	}
	if year.Year == nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "business year has no calendar year"})
		return nil, 0, nil, nil, false
	}

	invoicePage, err := invoices.Search(
		context.Request.Context(), businessYear,
		optionalQuery(context.Query("invoiceNumber")), optionalQuery(context.Query("customerId")),
		optionalQuery(context.Query("customerName")), optionalQuery(context.Query("productCode")),
		optionalQuery(context.Query("productName")), issuedFrom, issuedTo,
		optionalQuery(context.Query("paymentStatus")),
		optionalQuery(context.Query("sortBy")), optionalQuery(context.Query("sortDirection")),
		page, pageSize,
	)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return nil, 0, nil, nil, false
	}
	return invoicePage, *year.Year, issuedFrom, issuedTo, true
}

func writeInvoiceReportPDF(context *gin.Context, pdf []byte, filename string) {
	context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	context.Header("Pragma", "no-cache")
	context.Header("Expires", "0")
	context.Header("Content-Disposition", mime.FormatMediaType("inline", map[string]string{"filename": filename}))
	context.Data(http.StatusOK, "application/pdf", pdf)
}

func optionalReportDate(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func optionalQuery(value string) *string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return &value
}

func reportPositiveInteger(value string, fallback int) (int, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return 0, strconv.ErrSyntax
	}
	return parsed, nil
}
