package main

import (
	"fmt"
	"mime"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type DeliveryNotePrintHandler struct {
	notes         *DeliveryNoteRepository
	businessYears *BusinessYearRepository
	generator     *DeliveryNotePrintGenerator
}

func NewDeliveryNotePrintHandler(
	notes *DeliveryNoteRepository,
	businessYears *BusinessYearRepository,
	generator *DeliveryNotePrintGenerator,
) *DeliveryNotePrintHandler {
	return &DeliveryNotePrintHandler{notes: notes, businessYears: businessYears, generator: generator}
}

func (handler *DeliveryNotePrintHandler) Handle(context *gin.Context) {
	number := strings.TrimSpace(context.Param("deliveryNoteNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if number == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{
			"error": "deliveryNoteNumber is required and businessYear must contain only digits",
		})
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
	note, err := handler.notes.GetByNumber(context.Request.Context(), businessYear, number)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if note == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "delivery note not found"})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), note, *year.Year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filename := fmt.Sprintf(
		"%s-%s-%d.pdf",
		safeFilenamePart(trimmedString(note.CustomerName), "customer"),
		safeFilenamePart(note.DeliveryNoteNumber, "delivery-note"),
		*year.Year,
	)
	context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	context.Header("Content-Disposition", mime.FormatMediaType("inline", map[string]string{"filename": filename}))
	context.Data(http.StatusOK, "application/pdf", pdf)
}
