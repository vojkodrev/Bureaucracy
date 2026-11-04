package main

import (
	"fmt"
	"mime"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type CreditNotePrintHandler struct {
	creditNotes   *CreditNoteRepository
	businessYears *BusinessYearRepository
	generator     *InvoicePrintGenerator
}

func NewCreditNotePrintHandler(
	creditNotes *CreditNoteRepository,
	businessYears *BusinessYearRepository,
	generator *InvoicePrintGenerator,
) *CreditNotePrintHandler {
	return &CreditNotePrintHandler{
		creditNotes:   creditNotes,
		businessYears: businessYears,
		generator:     generator,
	}
}

func (handler *CreditNotePrintHandler) load(
	context *gin.Context,
	fromForm bool,
) (*CreditNote, int, bool) {
	number := strings.TrimSpace(context.Param("creditNoteNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if fromForm {
		businessYear = strings.TrimSpace(context.PostForm("businessYear"))
	}
	if number == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{
			"error": "a valid credit note number and business year are required",
		})
		return nil, 0, false
	}

	year, err := handler.businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil || year == nil || year.Year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return nil, 0, false
	}
	note, err := handler.creditNotes.GetByNumber(
		context.Request.Context(),
		businessYear,
		number,
	)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return nil, 0, false
	}
	if note == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "credit note not found"})
		return nil, 0, false
	}
	return note, *year.Year, true
}

func creditNoteAsInvoice(note *CreditNote) *Invoice {
	return &Invoice{
		ID:                  note.ID,
		InvoiceNumber:       note.CreditNoteNumber,
		IssueDate:           note.IssueDate,
		ServiceDate:         note.ServiceDate,
		DueDate:             note.DueDate,
		CustomerCode:        note.CustomerCode,
		CustomerName:        note.CustomerName,
		CustomerAddress:     note.CustomerAddress,
		CustomerPostalCode:  note.CustomerPostalCode,
		CustomerCity:        note.CustomerCity,
		CustomerCountry:     note.CustomerCountry,
		CustomerCountryName: note.CustomerCountryName,
		CustomerTaxID:       note.CustomerTaxID,
		IssuePlace:          note.IssuePlace,
		Currency:            note.Currency,
		Amount:              note.Amount,
		GoodsAmount:         note.GoodsAmount,
		IntroductoryText:    note.IntroductoryText,
		ClosingText:         note.ClosingText,
		Items:               note.Items,
	}
}

func creditNotePDFFilename(note *CreditNote, year int) string {
	return fmt.Sprintf(
		"%s-dobropis-%s-%d.pdf",
		safeFilenamePart(trimmedString(note.CustomerName), "customer"),
		safeFilenamePart(note.CreditNoteNumber, "credit-note"),
		year,
	)
}

func (handler *CreditNotePrintHandler) Handle(context *gin.Context) {
	note, year, ok := handler.load(context, false)
	if !ok {
		return
	}
	pdf, err := handler.generator.Generate(
		context.Request.Context(),
		creditNoteAsInvoice(note),
		year,
		CreditNotePrintDocument,
	)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	context.Header("Cache-Control", "no-store")
	context.Header("Content-Disposition", mime.FormatMediaType(
		"inline",
		map[string]string{"filename": creditNotePDFFilename(note, year)},
	))
	context.Data(http.StatusOK, "application/pdf", pdf)
}
