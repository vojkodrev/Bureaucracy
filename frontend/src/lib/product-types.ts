export type Product = {
    id: number
    productCode: string | null
    name: string | null
    barcode: string | null
    unit: string | null
    netPrice: number | null
    grossPrice: number | null
    taxRate: number | null
    taxCode: string | null
}

export type ProductPage = {
    products: Product[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
