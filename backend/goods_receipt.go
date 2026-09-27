package main

import "time"

type GoodsReceipt struct {
	ID            int                 `json:"id"`
	ReceiptNumber string              `json:"receiptNumber"`
	ReceiptDate   *time.Time          `json:"receiptDate"`
	ReceivedBy    *string             `json:"receivedBy"`
	Items         []*GoodsReceiptItem `json:"items"`
}

type GoodsReceiptItem struct {
	ID          int      `json:"id"`
	ProductCode *string  `json:"productCode"`
	ProductName *string  `json:"productName"`
	Unit        *string  `json:"unit"`
	Quantity    *float64 `json:"quantity"`
}

type GoodsReceiptPage struct {
	GoodsReceipts []*GoodsReceipt `json:"goodsReceipts"`
	TotalCount    int             `json:"totalCount"`
	Page          int             `json:"page"`
	PageSize      int             `json:"pageSize"`
	TotalPages    int             `json:"totalPages"`
}
