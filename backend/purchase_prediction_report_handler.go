package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type PurchasePredictionReportHandler struct {
	predictions   *PurchasePredictionRepository
	businessYears *BusinessYearRepository
	generator     *PurchasePredictionReportGenerator
}

func NewPurchasePredictionReportHandler(predictions *PurchasePredictionRepository, businessYears *BusinessYearRepository, generator *PurchasePredictionReportGenerator) *PurchasePredictionReportHandler {
	return &PurchasePredictionReportHandler{predictions: predictions, businessYears: businessYears, generator: generator}
}

func (handler *PurchasePredictionReportHandler) Handle(context *gin.Context) {
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if businessYear == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
		return
	}
	page, err := reportPositiveInteger(context.Query("page"), 1)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "page must be a positive integer"})
		return
	}
	pageSize, err := reportPositiveInteger(context.Query("pageSize"), 20)
	if err != nil || pageSize > 10000 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "pageSize must be between 1 and 10000"})
		return
	}
	year, err := handler.businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if year == nil || year.Year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return
	}
	result, err := handler.predictions.Search(
		context.Request.Context(), businessYear,
		optionalQuery(context.Query("customerCode")), optionalQuery(context.Query("customerName")),
		optionalQuery(context.Query("productCode")), optionalQuery(context.Query("productName")),
		page, pageSize,
	)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), result, *year.Year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeInvoiceReportPDF(context, pdf, "napoved-nakupov.pdf")
}
