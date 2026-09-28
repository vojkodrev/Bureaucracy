export type GoodsReceiptItem = {
    id: number
    productCode: string | null
    productName: string | null
    unit: string | null
    quantity: number | null
}

export type GoodsReceipt = {
    id: number
    receiptNumber: string
    receiptDate: string | null
    storage: string | null
    receivedBy: string | null
    items: GoodsReceiptItem[]
}

export type Storage = { code: string }

export type GoodsReceiptPage = {
    goodsReceipts: GoodsReceipt[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
