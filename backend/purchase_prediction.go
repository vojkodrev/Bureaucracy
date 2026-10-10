package main

type PurchasePrediction struct {
	ID           int64   `json:"id"`
	CustomerCode string  `json:"customerCode"`
	CustomerName *string `json:"customerName"`
	ProductCode  string  `json:"productCode"`
	ProductName  *string `json:"productName"`
	Score7Days   float64 `json:"score7Days"`
	Score14Days  float64 `json:"score14Days"`
	Score30Days  float64 `json:"score30Days"`
}

type PurchasePredictionPage struct {
	Predictions []*PurchasePrediction `json:"predictions"`
	TotalCount  int                   `json:"totalCount"`
	Page        int                   `json:"page"`
	PageSize    int                   `json:"pageSize"`
	TotalPages  int                   `json:"totalPages"`
}
