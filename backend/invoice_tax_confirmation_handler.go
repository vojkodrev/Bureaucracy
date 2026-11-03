package main

import (
	"net/http"
	"strconv"
	"strings"
	"time"

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
	if invoice.Cancelled != nil && *invoice.Cancelled {
		c.JSON(http.StatusConflict, gin.H{"error": "cancelled invoices cannot be tax confirmed"})
		return
	}
	existing, err := handler.details.Get(c.Request.Context(), businessYearID, invoice.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existing != nil {
		c.JSON(http.StatusOK, existing)
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
