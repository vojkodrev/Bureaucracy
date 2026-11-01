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
	sender        EmailSender
}

func NewAccountingExportHandler(
	businessYears *BusinessYearRepository,
	exports *AccountingExportRepository,
	sender EmailSender,
) *AccountingExportHandler {
	return &AccountingExportHandler{businessYears: businessYears, exports: exports, sender: sender}
}

func (handler *AccountingExportHandler) Handle(context *gin.Context) {
	content, month, year, ok := handler.generate(context, context.Query("month"), context.Query("year"), context.Query("numberFrom"), context.Query("numberTo"))
	if !ok {
		return
	}

	context.Header("Cache-Control", "no-store")
	context.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, accountingExportFilename(year, month)))
	context.Data(http.StatusOK, "text/plain; charset=utf-8", content)
}

func (handler *AccountingExportHandler) Send(context *gin.Context) {
	request, ok := parseDocumentEmailRequest(context)
	if !ok {
		return
	}
	content, month, year, ok := handler.generate(context, context.PostForm("month"), context.PostForm("year"), context.PostForm("numberFrom"), context.PostForm("numberTo"))
	if !ok {
		return
	}
	attachment := EmailAttachment{
		Filename:    accountingExportFilename(year, month),
		ContentType: "text/plain; charset=utf-8",
		Data:        content,
	}
	sendDocumentEmail(context, handler.sender, request, attachment, "")
}

func (handler *AccountingExportHandler) generate(context *gin.Context, monthValue, yearValue, numberFrom, numberTo string) ([]byte, int, int, bool) {
	month := 0
	var monthFilter *time.Month
	var monthErr error
	if monthValue != "" {
		month, monthErr = strconv.Atoi(monthValue)
	}
	year, yearErr := strconv.Atoi(yearValue)
	if monthValue != "" && (monthErr != nil || month < 1 || month > 12) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "month must be between 1 and 12"})
		return nil, 0, 0, false
	}
	if yearErr != nil || year < 1 || year > 9999 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "year must be between 1 and 9999"})
		return nil, 0, 0, false
	}
	numberFrom = strings.TrimSpace(numberFrom)
	numberTo = strings.TrimSpace(numberTo)
	if monthValue == "" && numberFrom == "" && numberTo == "" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "month, number from, or number to is required"})
		return nil, 0, 0, false
	}
	if (numberFrom != "" && !validAccountingExportNumber(numberFrom)) || (numberTo != "" && !validAccountingExportNumber(numberTo)) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "invoice numbers must contain exactly 5 digits"})
		return nil, 0, 0, false
	}
	if numberFrom != "" && numberTo != "" && numberFrom > numberTo {
		context.JSON(http.StatusBadRequest, gin.H{"error": "number from must not be greater than number to"})
		return nil, 0, 0, false
	}
	if monthValue != "" {
		value := time.Month(month)
		monthFilter = &value
	}

	businessYear, err := handler.businessYears.GetByCalendarYear(context.Request.Context(), year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return nil, 0, 0, false
	}
	if businessYear == nil || businessYear.Code == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return nil, 0, 0, false
	}
	businessYearCode := strings.TrimSpace(*businessYear.Code)
	if !businessYearPattern.MatchString(businessYearCode) {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "business year has an invalid code"})
		return nil, 0, 0, false
	}

	rows, err := handler.exports.List(context.Request.Context(), businessYearCode, year, monthFilter, numberFrom, numberTo)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return nil, 0, 0, false
	}
	if len(rows) == 0 {
		context.JSON(http.StatusNotFound, gin.H{"error": "no data found for the selected filters"})
		return nil, 0, 0, false
	}

	return generateAccountingExport(rows), month, year, true
}

func validAccountingExportNumber(value string) bool {
	if len(value) != 5 {
		return false
	}
	for _, character := range value {
		if character < '0' || character > '9' {
			return false
		}
	}
	return true
}

func accountingExportFilename(year, month int) string {
	if month == 0 {
		return fmt.Sprintf("izvoz-%04d.txt", year)
	}
	return fmt.Sprintf("izvoz-%04d-%02d.txt", year, month)
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
