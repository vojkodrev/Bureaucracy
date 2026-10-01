import type { InvoiceItem } from '@/lib/invoice-types'
import type { PriceQuoteDraft } from './hooks/usePriceQuoteDraft'

const storageKey = 'priceQuoteToInvoice'

type StoredPriceQuote = {
    quoteNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    issueDate: number | null
    dueDate: number | null
    introductoryText: string
    closingText: string
    items: InvoiceItem[]
}

export function storePriceQuoteForInvoice(draft: PriceQuoteDraft) {
    const storedQuote: StoredPriceQuote = {
        ...draft,
        issueDate: draft.issueDate?.getTime() ?? null,
        dueDate: draft.dueDate?.getTime() ?? null,
    }
    localStorage.setItem(storageKey, JSON.stringify(storedQuote))
}

export function takePriceQuoteForInvoice(): StoredPriceQuote | null {
    const value = localStorage.getItem(storageKey)
    if (!value) return null
    localStorage.removeItem(storageKey)
    try {
        return JSON.parse(value) as StoredPriceQuote
    } catch {
        return null
    }
}
