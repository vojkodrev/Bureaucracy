package main

type Product struct {
	ID          int      `json:"id"`
	ProductCode *string  `json:"productCode"`
	Name        *string  `json:"name"`
	Barcode     *string  `json:"barcode"`
	Unit        *string  `json:"unit"`
	NetPrice    *float64 `json:"netPrice"`
	GrossPrice  *float64 `json:"grossPrice"`
	TaxRate     *float64 `json:"taxRate"`
	TaxCode     *string  `json:"taxCode"`
}

type ProductPage struct {
	Products   []*Product `json:"products"`
	TotalCount int        `json:"totalCount"`
	Page       int        `json:"page"`
	PageSize   int        `json:"pageSize"`
	TotalPages int        `json:"totalPages"`
}
