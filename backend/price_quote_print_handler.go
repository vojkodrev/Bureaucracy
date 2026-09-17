package main

import (
	"fmt"
	"mime"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type PriceQuotePrintHandler struct {
	quotes        *PriceQuoteRepository
	businessYears *BusinessYearRepository
	generator     *PriceQuotePrintGenerator
}

func NewPriceQuotePrintHandler(
	quotes *PriceQuoteRepository,
	businessYears *BusinessYearRepository,
	generator *PriceQuotePrintGenerator,
) *PriceQuotePrintHandler {
	return &PriceQuotePrintHandler{quotes: quotes, businessYears: businessYears, generator: generator}
}

func (handler *PriceQuotePrintHandler) Handle(context *gin.Context) {
	quoteNumber := strings.TrimSpace(context.Param("quoteNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if quoteNumber == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{
			"error": "quoteNumber is required and businessYear must contain only digits",
		})
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
	quote, err := handler.quotes.GetByNumber(context.Request.Context(), businessYear, quoteNumber)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if quote == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "price quote not found"})
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), quote, *year.Year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filename := fmt.Sprintf(
		"%s-%s-%d.pdf",
		safeFilenamePart(trimmedString(quote.CustomerName), "customer"),
		safeFilenamePart(quote.QuoteNumber, "price-quote"),
		*year.Year,
	)
	context.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	context.Header("Content-Disposition", mime.FormatMediaType("inline", map[string]string{"filename": filename}))
	context.Data(http.StatusOK, "application/pdf", pdf)
}
