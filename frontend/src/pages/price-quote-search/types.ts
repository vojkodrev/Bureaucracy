export type PriceQuote = {
    id: number
    quoteNumber: string
    issueDate: string | null
    dueDate: string | null
    customerCode: string | null
    customerName: string | null
    currency: string | null
    amount: number | null
}

export type PriceQuotePage = {
    priceQuotes: PriceQuote[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export type PriceQuoteSortColumn = 'quoteNumber' | 'customer' | 'amount' | 'issueDate' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export type PriceQuoteSearchCriteria = {
    quoteNumber: string
    customerId: string
    customerName: string
    productCode: string
    productName: string
    from: string
    to: string
    page: string
    pageSize: string
    sortBy: PriceQuoteSortColumn | ''
    sortDirection: SortDirection | ''
}

export const priceQuoteSortColumns: PriceQuoteSortColumn[] = [
    'quoteNumber', 'customer', 'amount', 'issueDate', 'dueDate',
]
