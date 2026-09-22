export type InventoryItem = {
    id: number
    productCode: string | null
    name: string | null
    unit: string | null
    minimumStockLevel: number | null
}

export type InventoryItemPage = {
    items: InventoryItem[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
