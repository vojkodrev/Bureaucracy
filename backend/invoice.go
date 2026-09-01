package main

import "time"

type Invoice struct {
	ID               int        `json:"id"`
	InvoiceNumber    string     `json:"invoiceNumber"`
	IssueDate        *time.Time `json:"issueDate"`
	ServiceDate      *time.Time `json:"serviceDate"`
	DueDate          *time.Time `json:"dueDate"`
	PaymentDate      *time.Time `json:"paymentDate"`
	CustomerCode     *string    `json:"customerCode"`
	CustomerName     *string    `json:"customerName"`
	CustomerAddress  *string    `json:"customerAddress"`
	CustomerCity     *string    `json:"customerCity"`
	CustomerContact  *string    `json:"customerContact"`
	Currency         *string    `json:"currency"`
	Amount           *float64   `json:"amount"`
	GoodsAmount      *float64   `json:"goodsAmount"`
	PaidAmount       *float64   `json:"paidAmount"`
	PaymentReference *string    `json:"paymentReference"`
	Cancelled        *bool      `json:"cancelled"`
}
