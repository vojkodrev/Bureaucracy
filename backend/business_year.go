package main

type BusinessYear struct {
	Code        *string `json:"code"`
	Description *string `json:"description"`
	Year        *int    `json:"year"`
	DerivedFrom *string `json:"derivedFrom"`
}

type BusinessYearPage struct {
	BusinessYears []*BusinessYear `json:"businessYears"`
	TotalCount    int             `json:"totalCount"`
	Page          int             `json:"page"`
	PageSize      int             `json:"pageSize"`
	TotalPages    int             `json:"totalPages"`
}
