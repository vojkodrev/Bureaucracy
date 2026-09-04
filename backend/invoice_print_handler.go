package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type InvoicePrintHandler struct {
	invoices      *InvoiceRepository
	businessYears *BusinessYearRepository
	generator     *InvoicePrintGenerator
}

func NewInvoicePrintHandler(
	invoices *InvoiceRepository,
	businessYears *BusinessYearRepository,
	generator *InvoicePrintGenerator,
) *InvoicePrintHandler {
	return &InvoicePrintHandler{
		invoices:      invoices,
		businessYears: businessYears,
		generator:     generator,
	}
}

func (handler *InvoicePrintHandler) Handle(context *gin.Context) {
	invoiceNumber := strings.TrimSpace(context.Param("invoiceNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
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

	pdf, err := handler.generator.Generate(context.Request.Context(), invoice, *year.Year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	filename := strings.NewReplacer("\"", "", "\r", "", "\n", "").Replace(invoiceNumber)
	context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	context.Header("Pragma", "no-cache")
	context.Header("Expires", "0")
	context.Header("Content-Disposition", fmt.Sprintf(`inline; filename="racun-%s-%d.pdf"`, filename, *year.Year))
	context.Data(http.StatusOK, "application/pdf", pdf)
}
