import type { InvoiceItem } from '@/lib/invoice-types'

export type DeliveryNote = {
    id: number
    deliveryNoteNumber: string
    issueDate: string | null
    deliveryDate: string | null
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
    withoutAmounts: boolean
    items?: InvoiceItem[]
}

export type DeliveryNotePage = {
    deliveryNotes: DeliveryNote[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export type DeliveryNoteSortColumn =
    | 'deliveryNoteNumber'
    | 'customer'
    | 'amount'
    | 'issueDate'
    | 'deliveryDate'

export type SortDirection = 'asc' | 'desc'

export type DeliveryNoteSearchCriteria = {
    deliveryNoteNumber: string
    customerId: string
    customerName: string
    productCode: string
    productName: string
    from: string
    to: string
    page: string
    pageSize: string
    sortBy: DeliveryNoteSortColumn | ''
    sortDirection: SortDirection | ''
}

export const deliveryNoteSortColumns: DeliveryNoteSortColumn[] = [
    'deliveryNoteNumber',
    'customer',
    'amount',
    'issueDate',
    'deliveryDate',
]
