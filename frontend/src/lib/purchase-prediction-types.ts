export type PurchasePrediction = {
    id: string
    customerCode: string
    customerName: string | null
    productCode: string
    productName: string | null
    score7Days: number
    score14Days: number
    score30Days: number
}

export type PurchasePredictionPage = {
    predictions: PurchasePrediction[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
