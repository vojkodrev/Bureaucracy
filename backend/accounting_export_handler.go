package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type AccountingExportHandler struct {
	businessYears *BusinessYearRepository
	exports       *AccountingExportRepository
}

func NewAccountingExportHandler(
	businessYears *BusinessYearRepository,
	exports *AccountingExportRepository,
) *AccountingExportHandler {
	return &AccountingExportHandler{businessYears: businessYears, exports: exports}
}

func (handler *AccountingExportHandler) Handle(context *gin.Context) {
	month, monthErr := strconv.Atoi(context.Query("month"))
	year, yearErr := strconv.Atoi(context.Query("year"))
	if monthErr != nil || month < 1 || month > 12 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "month must be between 1 and 12"})
		return
	}
	if yearErr != nil || year < 1 || year > 9999 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "year must be between 1 and 9999"})
		return
	}

	businessYear, err := handler.businessYears.GetByCalendarYear(context.Request.Context(), year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if businessYear == nil || businessYear.Code == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return
	}
	businessYearCode := strings.TrimSpace(*businessYear.Code)
	if !businessYearPattern.MatchString(businessYearCode) {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "business year has an invalid code"})
		return
	}

	rows, err := handler.exports.List(context.Request.Context(), businessYearCode, time.Month(month), year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if len(rows) == 0 {
		context.JSON(http.StatusNotFound, gin.H{"error": "no data found for the selected month"})
		return
	}

	content := generateAccountingExport(rows)
	context.Header("Cache-Control", "no-store")
	context.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="izvoz-%04d-%02d.txt"`, year, month))
	context.Data(http.StatusOK, "text/plain; charset=utf-8", content)
}

func generateAccountingExport(rows []AccountingExportRow) []byte {
	var output bytes.Buffer
	previousInvoiceNumber := ""
	for _, row := range rows {
		invoiceNumber := nullString(row.InvoiceNumber)
		if invoiceNumber != previousInvoiceNumber {
			fmt.Fprintf(&output, "R%-8s%-8s%-8s%-10s%10s%10s%10s%-20s%-50s\r\n",
				nullDate(row.IssueDate), nullDate(row.ServiceDate), nullDate(row.DueDate), invoiceNumber,
				nullAmount(row.InvoiceGross), nullAmount(row.InvoiceTax), nullAmount(row.InvoiceNet),
				nullString(row.CustomerTaxID), nullString(row.CustomerName))
		}
		fmt.Fprintf(&output, "A%-6s%38s%10s%10s%-50s\r\n",
			accountingAccount(nullString(row.ProductCode)), nullAmount(row.ItemGross),
			nullAmount(row.ItemTax), nullAmount(row.ItemNet), nullString(row.ItemDescription))
		previousInvoiceNumber = invoiceNumber
	}
	return output.Bytes()
}

func nullString(value sql.NullString) string {
	if !value.Valid {
		return ""
	}
	return value.String
}

func nullDate(value sql.NullTime) string {
	if !value.Valid {
		return ""
	}
	return value.Time.Format("02012006")
}

func nullAmount(value sql.NullFloat64) string {
	if !value.Valid {
		return ""
	}
	return strings.ReplaceAll(fmt.Sprintf("%.2f", value.Float64), ",", ".")
}
