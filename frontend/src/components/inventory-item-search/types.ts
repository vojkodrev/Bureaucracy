export type InventoryItemSortColumn =
    | 'productCode'
    | 'name'
    | 'unit'
    | 'minimumStockLevel'

export type InventoryItemSearchCriteria = {
    productCode: string
    productName: string
    resultsView: 'itemList' | 'lowStock'
    page: string
    pageSize: string
    sortBy: InventoryItemSortColumn | ''
    sortDirection: 'asc' | 'desc' | ''
}
