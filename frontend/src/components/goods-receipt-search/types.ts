export type GoodsReceiptSortColumn = 'receiptNumber' | 'receiptDate' | 'receivedBy'
export type SortDirection = 'asc' | 'desc'

export type GoodsReceiptSearchCriteria = {
    from: string
    to: string
    productCode: string
    productName: string
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
