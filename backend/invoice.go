package main

import "time"

type Invoice struct {
	ID                 int            `json:"id"`
	InvoiceNumber      string         `json:"invoiceNumber"`
	IssueDate          *time.Time     `json:"issueDate"`
	ServiceDate        *time.Time     `json:"serviceDate"`
	DueDate            *time.Time     `json:"dueDate"`
	PaymentDate        *time.Time     `json:"paymentDate"`
	CustomerCode       *string        `json:"customerCode"`
	CustomerName       *string        `json:"customerName"`
	CustomerAddress    *string        `json:"customerAddress"`
	CustomerPostalCode *string        `json:"customerPostalCode"`
	CustomerCity       *string        `json:"customerCity"`
	CustomerCountry    *string        `json:"customerCountry"`
	IssuePlace         *string        `json:"issuePlace"`
	CustomerContact    *string        `json:"customerContact"`
	Currency           *string        `json:"currency"`
	Amount             *float64       `json:"amount"`
	GoodsAmount        *float64       `json:"goodsAmount"`
	PaidAmount         *float64       `json:"paidAmount"`
	PaymentReference   *string        `json:"paymentReference"`
	IntroductoryText   *string        `json:"introductoryText"`
	ClosingText        *string        `json:"closingText"`
	Cancelled          *bool          `json:"cancelled"`
	Items              []*InvoiceItem `json:"items"`
}

type InvoiceItem struct {
	ID            int      `json:"id"`
	Sequence      *int     `json:"sequence"`
	ProductCode   *string  `json:"productCode"`
	ProductName   *string  `json:"productName"`
	UnitPrice     *float64 `json:"unitPrice"`
	UnitTaxAmount *float64 `json:"unitTaxAmount"`
	Quantity      *float64 `json:"quantity"`
	Discount      *float64 `json:"discount"`
	NetAmount     *float64 `json:"netAmount"`
	GrossAmount   *float64 `json:"grossAmount"`
}

type InvoicePage struct {
	Invoices   []*Invoice `json:"invoices"`
	TotalCount int        `json:"totalCount"`
	Page       int        `json:"page"`
	PageSize   int        `json:"pageSize"`
	TotalPages int        `json:"totalPages"`
}
