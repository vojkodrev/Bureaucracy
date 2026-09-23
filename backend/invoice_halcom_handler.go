package main

import (
	"fmt"
	"mime"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type InvoiceHalcomHandler struct {
	invoices      *InvoiceRepository
	businessYears *BusinessYearRepository
	generator     *InvoiceHalcomGenerator
}

func NewInvoiceHalcomHandler(invoices *InvoiceRepository, businessYears *BusinessYearRepository, generator *InvoiceHalcomGenerator) *InvoiceHalcomHandler {
	return &InvoiceHalcomHandler{invoices: invoices, businessYears: businessYears, generator: generator}
}

func (handler *InvoiceHalcomHandler) Handle(context *gin.Context) {
	invoiceNumber := strings.TrimSpace(context.Param("invoiceNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if invoiceNumber == "" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "invoice number is required"})
		return
	}
	if businessYear == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
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
	invoice, err := handler.invoices.GetByNumber(context.Request.Context(), businessYear, invoiceNumber)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if invoice == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
		return
	}
	archive, err := handler.generator.Generate(context.Request.Context(), invoice, *year.Year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filename := fmt.Sprintf("%s-%s-%d-halcom.zip", safeFilenamePart(trimmedString(invoice.CustomerName), "customer"), safeFilenamePart(invoice.InvoiceNumber, "invoice"), *year.Year)
	context.Header("Cache-Control", "no-store")
	context.Header("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": filename}))
	context.Data(http.StatusOK, "application/zip", archive)
}
