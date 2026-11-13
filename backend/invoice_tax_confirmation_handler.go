package main

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"bureaucracy/backend/lib"
	"github.com/gin-gonic/gin"
)

type InvoiceTaxConfirmationHandler struct {
	invoices *InvoiceRepository
	details  *InvoiceTaxConfirmationRepository
	furs     *FURSClient
}

func NewInvoiceTaxConfirmationHandler(invoices *InvoiceRepository, details *InvoiceTaxConfirmationRepository, furs *FURSClient) *InvoiceTaxConfirmationHandler {
	return &InvoiceTaxConfirmationHandler{invoices: invoices, details: details, furs: furs}
}

func (handler *InvoiceTaxConfirmationHandler) Handle(c *gin.Context) {
	invoiceNumber := strings.TrimSpace(c.Param("invoiceNumber"))
	businessYear := strings.TrimSpace(c.PostForm("businessYear"))
	if !businessYearPattern.MatchString(businessYear) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
		return
	}
	businessYearID, err := strconv.Atoi(businessYear)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid businessYear"})
		return
	}
	invoice, err := handler.invoices.GetByNumber(c.Request.Context(), businessYear, invoiceNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if invoice == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
		return
	}
	if invoice.ZOI != nil && invoice.EOR != nil &&
		strings.TrimSpace(*invoice.ZOI) != "" && strings.TrimSpace(*invoice.EOR) != "" {
		c.JSON(http.StatusConflict, gin.H{"error": "invoice is already tax confirmed"})
		return
	}
	if invoice.Cancelled != nil && *invoice.Cancelled {
		c.JSON(http.StatusConflict, gin.H{"error": "cancelled invoices cannot be tax confirmed"})
		return
	}
	if err := validateTaxConfirmationInvoice(invoice); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}
	issuedAt := time.Now().Truncate(time.Second)
	zoi, eor, err := handler.furs.ConfirmInvoice(c.Request.Context(), businessYearID, invoice, issuedAt)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	confirmation := &InvoiceTaxConfirmation{BusinessYearID: businessYearID, InvoiceID: invoice.ID,
		InvoiceNumber: invoice.InvoiceNumber, IssueDateTime: issuedAt, ZOI: zoi, EOR: eor}
	if err := handler.details.Save(c.Request.Context(), confirmation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, confirmation)
}

func validateTaxConfirmationInvoice(invoice *Invoice) error {
	lineCount := 0
	for _, item := range invoice.Items {
		if item != nil {
			lineCount++
		}
	}
	if lineCount == 0 {
		return fmt.Errorf("invoice %s must contain at least one line for FURS confirmation", invoice.InvoiceNumber)
	}
	if lib.CurrencyCents(float64OrZero(invoice.Amount)) == 0 {
		return fmt.Errorf("invoice %s total must not be zero for FURS confirmation", invoice.InvoiceNumber)
	}
	return nil
}
