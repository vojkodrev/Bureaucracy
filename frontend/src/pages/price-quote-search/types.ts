import type { InvoiceItem } from '@/lib/invoice-types'

export type PriceQuote = {
    id: number
    quoteNumber: string
    issueDate: string | null
    dueDate: string | null
    customerCode: string | null
    customerName: string | null
    customerAddress?: string | null
    customerPostalCode?: string | null
    customerCity?: string | null
    customerCountry?: string | null
    currency: string | null
    amount: number | null
    introductoryText?: string | null
    closingText?: string | null
    items?: InvoiceItem[]
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
