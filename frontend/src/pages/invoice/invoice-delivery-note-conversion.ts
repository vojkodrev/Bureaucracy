import type { InvoiceItem } from '@/lib/invoice-types'
import type { InvoiceDraft } from './hooks/useInvoiceDraft'

const storageKey = 'invoiceToDeliveryNote'

type StoredInvoice = {
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    introductoryText: string
    closingText: string
    items: InvoiceItem[]
}

export function storeInvoiceForDeliveryNote(draft: InvoiceDraft) {
    const storedInvoice: StoredInvoice = {
        customerId: draft.customerId,
        customerName: draft.customerName,
        customerAddress: draft.customerAddress,
        customerPostalCode: draft.customerPostalCode,
        customerCity: draft.customerCity,
        customerCountry: draft.customerCountry,
        introductoryText: draft.introductoryText,
        closingText: draft.closingText,
        items: draft.invoiceItems,
    }
    localStorage.setItem(storageKey, JSON.stringify(storedInvoice))
}

export function takeInvoiceForDeliveryNote(): StoredInvoice | null {
    const value = localStorage.getItem(storageKey)
    if (!value) return null
    localStorage.removeItem(storageKey)
    try {
        return JSON.parse(value) as StoredInvoice
    } catch {
        return null
    }
}
