import type { InvoiceItem } from '@/lib/invoice-types'

export type CreditNote = {
    id: number
    creditNoteNumber: string
    issueDate: string | null
    serviceDate: string | null
    dueDate: string | null
    customerCode: string | null
    customerName: string | null
    customerAddress?: string | null
    customerPostalCode?: string | null
    customerCity?: string | null
    customerCountry?: string | null
    currency: string | null
    amount: number | null
    goodsAmount?: number | null
    introductoryText?: string | null
    closingText?: string | null
    items?: InvoiceItem[]
}

export type CreditNotePage = {
    creditNotes: CreditNote[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
