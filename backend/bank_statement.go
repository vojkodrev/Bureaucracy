package main

import "time"

type BankAccount struct {
	ID            int     `json:"id"`
	Code          string  `json:"code"`
	Name          *string `json:"name"`
	AccountNumber *string `json:"accountNumber"`
}

type BankStatementEntry struct {
	ID              int        `json:"id"`
	StatementID     int        `json:"statementId"`
	StatementNumber *int       `json:"statementNumber"`
	PaymentDate     *time.Time `json:"paymentDate"`
	CustomerID      *string    `json:"customerId"`
	CustomerName    *string    `json:"customerName"`
	TransactionType *string    `json:"transactionType"`
	Outflow         *float64   `json:"outflow"`
	Inflow          *float64   `json:"inflow"`
	InvoiceNumber   *string    `json:"invoiceNumber"`
}

type BankStatementPage struct {
	Entries    []*BankStatementEntry `json:"entries"`
	TotalCount int                   `json:"totalCount"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"pageSize"`
	TotalPages int                   `json:"totalPages"`
}
