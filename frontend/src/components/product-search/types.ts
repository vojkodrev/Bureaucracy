export type ProductSortColumn =
    | 'productCode'
    | 'name'
    | 'unit'
    | 'netPrice'
    | 'grossPrice'
    | 'taxCode'
    | 'taxRate'

export type SortDirection = 'asc' | 'desc'

export type ProductSearchForm = {
    productCode: string
    productName: string
    page: string
    pageSize: string
    sortBy: ProductSortColumn | ''
    sortDirection: SortDirection | ''
}
