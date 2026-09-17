package main

import "time"

type PriceQuote struct {
	ID           int        `json:"id"`
	QuoteNumber  string     `json:"quoteNumber"`
	IssueDate    *time.Time `json:"issueDate,omitempty"`
	DueDate      *time.Time `json:"dueDate,omitempty"`
	CustomerCode *string    `json:"customerCode,omitempty"`
	CustomerName *string    `json:"customerName,omitempty"`
	Currency     *string    `json:"currency,omitempty"`
	Amount       *float64   `json:"amount,omitempty"`
}

type PriceQuotePage struct {
	PriceQuotes []*PriceQuote `json:"priceQuotes"`
	TotalCount  int           `json:"totalCount"`
	Page        int           `json:"page"`
	PageSize    int           `json:"pageSize"`
	TotalPages  int           `json:"totalPages"`
}
