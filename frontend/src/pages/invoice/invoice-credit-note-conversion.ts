import type { InvoiceItem } from '@/lib/invoice-types'
import type { InvoiceDraft } from './hooks/useInvoiceDraft'

const storageKey = 'invoiceToCreditNote'

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

export function storeInvoiceForCreditNote(draft: InvoiceDraft) {
    const invoiceNumber = draft.invoiceNumber.trim()
    if (!invoiceNumber) {
        throw new Error('Enter an invoice number before converting it')
    }

    const storedInvoice: StoredInvoice = {
        customerId: draft.customerId,
        customerName: draft.customerName,
        customerAddress: draft.customerAddress,
        customerPostalCode: draft.customerPostalCode,
        customerCity: draft.customerCity,
        customerCountry: draft.customerCountry,
        introductoryText: draft.introductoryText,
        closingText: draft.closingText,
        items: draft.invoiceItems.map((item) => ({
            ...item,
            originalInvoiceNumber: invoiceNumber,
        })),
    }
    localStorage.setItem(storageKey, JSON.stringify(storedInvoice))
}

export function takeInvoiceForCreditNote(): StoredInvoice | null {
    const value = localStorage.getItem(storageKey)
    if (!value) return null
    localStorage.removeItem(storageKey)
    try {
        return JSON.parse(value) as StoredInvoice
    } catch {
        return null
    }
}
