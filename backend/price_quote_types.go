package main

import "time"

type PriceQuote struct {
	ID                 int            `json:"id"`
	QuoteNumber        string         `json:"quoteNumber"`
	IssueDate          *time.Time     `json:"issueDate,omitempty"`
	DueDate            *time.Time     `json:"dueDate,omitempty"`
	CustomerCode       *string        `json:"customerCode,omitempty"`
	CustomerName       *string        `json:"customerName,omitempty"`
	CustomerAddress    *string        `json:"customerAddress,omitempty"`
	CustomerPostalCode *string        `json:"customerPostalCode,omitempty"`
	CustomerCity       *string        `json:"customerCity,omitempty"`
	CustomerCountry    *string        `json:"customerCountry,omitempty"`
	CustomerTaxID      *string        `json:"customerTaxId,omitempty"`
	IssuePlace         *string        `json:"issuePlace,omitempty"`
	Currency           *string        `json:"currency,omitempty"`
	Amount             *float64       `json:"amount,omitempty"`
	IntroductoryText   *string        `json:"introductoryText,omitempty"`
	ClosingText        *string        `json:"closingText,omitempty"`
	Items              []*InvoiceItem `json:"items"`
}

type PriceQuotePage struct {
	PriceQuotes []*PriceQuote `json:"priceQuotes"`
	TotalCount  int           `json:"totalCount"`
	Page        int           `json:"page"`
	PageSize    int           `json:"pageSize"`
	TotalPages  int           `json:"totalPages"`
}

type PriceQuoteTextTemplate struct {
	IntroductoryText *string `json:"introductoryText"`
	ClosingText      *string `json:"closingText"`
}
