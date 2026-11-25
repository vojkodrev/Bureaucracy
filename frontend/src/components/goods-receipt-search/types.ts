export type GoodsReceiptSortColumn = 'receiptNumber' | 'receiptDate' | 'receivedBy'
export type SortDirection = 'asc' | 'desc'

export type GoodsReceiptSearchCriteria = {
    receiptNumber: string
    from: string
    to: string
    inventoryItemCode: string
    inventoryItemName: string
    page: string
    pageSize: string
    sortBy: GoodsReceiptSortColumn | ''
    sortDirection: SortDirection | ''
}

export const goodsReceiptSortColumns: GoodsReceiptSortColumn[] = [
    'receiptNumber',
    'receiptDate',
    'receivedBy',
]
