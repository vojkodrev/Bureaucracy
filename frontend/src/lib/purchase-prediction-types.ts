export type PurchasePrediction = {
    id: string
    customerCode: string
    customerName: string | null
    productCode: string
    productName: string | null
    daysSinceLastOrder: number
    averageOrderFrequencyDays: number | null
    score7Days: number
    score14Days: number
    score30Days: number
}

export type PurchasePredictionPage = {
    predictions: PurchasePrediction[]
    snapshotId: string
    snapshotName: string
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export type PurchasePredictionSnapshot = {
    id: string
    name: string
}
