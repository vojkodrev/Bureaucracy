package main

import "time"

type BankAccount struct {
	ID            int     `json:"id"`
	Code          string  `json:"code"`
	Name          *string `json:"name"`
	AccountNumber *string `json:"accountNumber"`
}

type BankStatementEntry struct {
	ID                int        `json:"id"`
	StatementID       int        `json:"statementId"`
	StatementNumber   *int       `json:"statementNumber"`
	PaymentDate       *time.Time `json:"paymentDate"`
	CustomerID        *string    `json:"customerId"`
	CustomerName      *string    `json:"customerName"`
	TransactionType   *string    `json:"transactionType"`
	TransactionTypeID *int       `json:"transactionTypeId"`
	Outflow           *float64   `json:"outflow"`
	Inflow            *float64   `json:"inflow"`
	DocumentNumber    *string    `json:"documentNumber"`
}

type BankStatement struct {
	ID              int                   `json:"id"`
	StatementNumber *int                  `json:"statementNumber"`
	StatementDate   *time.Time            `json:"statementDate"`
	BankAccount     *string               `json:"bankAccount"`
	Entries         []*BankStatementEntry `json:"entries"`
}

type BankTransactionType struct {
	ID        int     `json:"id"`
	Code      *int    `json:"code"`
	Name      *string `json:"name"`
	Direction *string `json:"direction"`
}

type BankStatementPage struct {
	Entries    []*BankStatementEntry `json:"entries"`
	TotalCount int                   `json:"totalCount"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"pageSize"`
	TotalPages int                   `json:"totalPages"`
}
