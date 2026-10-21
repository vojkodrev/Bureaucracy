export type InventoryItemSortColumn =
    | 'inventoryItemCode'
    | 'name'
    | 'unit'
    | 'minimumStockLevel'

export type InventoryItemSearchCriteria = {
    inventoryItemCode: string
    inventoryItemName: string
    resultsView: 'itemList' | 'lowStock'
    page: string
    pageSize: string
    sortBy: InventoryItemSortColumn | ''
    sortDirection: 'asc' | 'desc' | ''
}
