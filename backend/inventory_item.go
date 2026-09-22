package main

type InventoryItem struct {
	ID                int      `json:"id"`
	ProductCode       *string  `json:"productCode"`
	Name              *string  `json:"name"`
	Unit              *string  `json:"unit"`
	MinimumStockLevel *float64 `json:"minimumStockLevel"`
}

type InventoryItemPage struct {
	Items      []*InventoryItem `json:"items"`
	TotalCount int              `json:"totalCount"`
	Page       int              `json:"page"`
	PageSize   int              `json:"pageSize"`
	TotalPages int              `json:"totalPages"`
}
