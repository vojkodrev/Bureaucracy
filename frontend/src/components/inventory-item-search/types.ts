export type InventoryItemSortColumn =
    | 'productCode'
    | 'name'
    | 'unit'
    | 'minimumStockLevel'

export type InventoryItemSearchCriteria = {
    productCode: string
    productName: string
    page: string
    pageSize: string
    sortBy: InventoryItemSortColumn | ''
    sortDirection: 'asc' | 'desc' | ''
}
