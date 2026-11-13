package main

import "time"

type DeliveryNote struct {
	ID                 int            `json:"id"`
	DeliveryNoteNumber string         `json:"deliveryNoteNumber"`
	IssueDate          *time.Time     `json:"issueDate,omitempty"`
	DeliveryDate       *time.Time     `json:"deliveryDate,omitempty"`
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
	WithoutAmounts     bool           `json:"withoutAmounts"`
	Items              []*InvoiceItem `json:"items"`
}

type DeliveryNotePage struct {
	DeliveryNotes []*DeliveryNote `json:"deliveryNotes"`
	TotalCount    int             `json:"totalCount"`
	Page          int             `json:"page"`
	PageSize      int             `json:"pageSize"`
	TotalPages    int             `json:"totalPages"`
}
