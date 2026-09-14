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
	invoices      *InvoiceRepository
	businessYears *BusinessYearRepository
	generator     *InvoiceReportGenerator
}

func NewInvoiceReportHandler(invoices *InvoiceRepository, businessYears *BusinessYearRepository, generator *InvoiceReportGenerator) *InvoiceReportHandler {
	return &InvoiceReportHandler{invoices: invoices, businessYears: businessYears, generator: generator}
}

func (handler *InvoiceReportHandler) Handle(context *gin.Context) {
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if businessYear == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
		return
	}
	issuedFrom, err := optionalReportDate(context.Query("from"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "from must be a date in YYYY-MM-DD format"})
		return
	}
	issuedTo, err := optionalReportDate(context.Query("to"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "to must be a date in YYYY-MM-DD format"})
		return
	}
	if issuedFrom != nil && issuedTo != nil && issuedFrom.After(*issuedTo) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "from must not be after to"})
		return
	}
	page, err := reportPositiveInteger(context.Query("page"), 1)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "page must be a positive integer"})
		return
	}
	pageSize, err := reportPositiveInteger(context.Query("pageSize"), 20)
	if err != nil || pageSize > 100 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "pageSize must be between 1 and 100"})
		return
	}
	year, err := handler.businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return
	}
	if year.Year == nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "business year has no calendar year"})
		return
	}

	invoicePage, err := handler.invoices.Search(
		context.Request.Context(), businessYear,
		optionalQuery(context.Query("invoiceNumber")), optionalQuery(context.Query("customerId")),
		optionalQuery(context.Query("customerName")), issuedFrom, issuedTo,
		optionalQuery(context.Query("sortBy")), optionalQuery(context.Query("sortDirection")),
		page, pageSize,
	)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), invoicePage, *year.Year, issuedFrom, issuedTo)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	context.Header("Pragma", "no-cache")
	context.Header("Expires", "0")
	context.Header("Content-Disposition", mime.FormatMediaType("inline", map[string]string{"filename": invoiceReportFilename(issuedFrom, issuedTo)}))
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
