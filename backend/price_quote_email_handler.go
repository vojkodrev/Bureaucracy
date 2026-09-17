package main

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type PriceQuoteEmailHandler struct {
	quotes        *PriceQuoteRepository
	customers     *CustomerRepository
	businessYears *BusinessYearRepository
	generator     *PriceQuotePrintGenerator
	sender        EmailSender
}

func NewPriceQuoteEmailHandler(quotes *PriceQuoteRepository, customers *CustomerRepository, businessYears *BusinessYearRepository, generator *PriceQuotePrintGenerator, sender EmailSender) *PriceQuoteEmailHandler {
	return &PriceQuoteEmailHandler{quotes: quotes, customers: customers, businessYears: businessYears, generator: generator, sender: sender}
}

func (handler *PriceQuoteEmailHandler) Send(context *gin.Context) {
	request, ok := parseDocumentEmailRequest(context)
	if !ok {
		return
	}
	quote, customer, year, ok := handler.loadPriceQuote(context)
	if !ok {
		return
	}
	pdf, err := handler.generator.Generate(context.Request.Context(), quote, year)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate the price quote PDF"})
		return
	}
	storedRecipient := ""
	if customer != nil {
		storedRecipient = trimmedString(customer.Email)
	}
	sendDocumentEmail(context, handler.sender, request, priceQuotePDFFilename(quote, year), pdf, storedRecipient)
}

func (handler *PriceQuoteEmailHandler) loadPriceQuote(context *gin.Context) (*PriceQuote, *Customer, int, bool) {
	quoteNumber := strings.TrimSpace(context.Param("quoteNumber"))
	businessYear := strings.TrimSpace(context.Query("businessYear"))
	if quoteNumber == "" || !businessYearPattern.MatchString(businessYear) {
		context.JSON(http.StatusBadRequest, gin.H{"error": "a valid price quote number and business year are required"})
		return nil, nil, 0, false
	}
	year, err := handler.businessYears.GetByCode(context.Request.Context(), businessYear)
	if err != nil || year == nil || year.Year == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "business year not found"})
		return nil, nil, 0, false
	}
	quote, err := handler.quotes.GetByNumber(context.Request.Context(), businessYear, quoteNumber)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load price quote"})
		return nil, nil, 0, false
	}
	if quote == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "price quote not found"})
		return nil, nil, 0, false
	}
	var customer *Customer
	if customerCode := trimmedString(quote.CustomerCode); customerCode != "" {
		customer, err = handler.customers.GetByID(context.Request.Context(), businessYear, customerCode)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "could not load price quote customer"})
			return nil, nil, 0, false
		}
	}
	return quote, customer, *year.Year, true
}
