package main

type TaxCode struct {
	ID          int      `json:"id"`
	Code        string   `json:"code"`
	Description *string  `json:"description"`
	Rate        *float64 `json:"rate"`
}
