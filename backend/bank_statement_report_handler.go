package main

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type BankStatementReportHandler struct {
	statements    *BankStatementRepository
	businessYears *BusinessYearRepository
	generator     *BankStatementReportGenerator
}

func NewBankStatementReportHandler(statements *BankStatementRepository, businessYears *BusinessYearRepository, generator *BankStatementReportGenerator) *BankStatementReportHandler {
	return &BankStatementReportHandler{statements: statements, businessYears: businessYears, generator: generator}
}

func (handler *BankStatementReportHandler) Handle(context *gin.Context) {
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if businessYear == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "businessYear must contain only digits"})
		return
	}
	dateFrom, err := optionalReportDate(context.Query("from"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "from must be a date in YYYY-MM-DD format"})
		return
	}
	dateTo, err := optionalReportDate(context.Query("to"))
	if err != nil || dateFrom != nil && dateTo != nil && dateFrom.After(*dateTo) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "to must be a valid date not before from"})
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
	statementNumber, err := optionalReportInteger(context.Query("statementNumber"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "statementNumber must be an integer"})
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

	statementPage, err := handler.statements.Search(
		context.Request.Context(), businessYear, dateFrom, dateTo, statementNumber,
		optionalQuery(context.Query("documentNumber")), optionalQuery(context.Query("reference")), optionalQuery(context.Query("bankAccount")),
		optionalQuery(context.Query("customerId")), optionalQuery(context.Query("customerName")),
		optionalQuery(context.Query("sortBy")), optionalQuery(context.Query("sortDirection")),
		page, pageSize,
	)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), statementPage, *year.Year, dateFrom, dateTo)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	writeInvoiceReportPDF(context, pdf, bankStatementReportFilename(dateFrom, dateTo))
}

func optionalReportInteger(value string) (*int, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}
