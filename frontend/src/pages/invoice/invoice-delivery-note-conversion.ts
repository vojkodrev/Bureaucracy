import { dateForApi } from '@/lib/dates'
import type { InvoiceItem } from '@/lib/invoice-types'
import { fetchDeliveryNoteExists } from '@/pages/delivery-note-search/delivery-note-search-api'
import type { InvoiceDraft } from './hooks/useInvoiceDraft'

const storageKey = 'invoiceToDeliveryNote'

function stripReferenceYear(reference: string): string {
    return reference.trim().replace(/(.+)\/[1-9]\d{3}$/, '$1').trim()
}

export function deliveryNoteNumberFromInvoiceReference(reference: string): string {
    const number = stripReferenceYear(reference)
    return /^\d+$/.test(number) ? number.padStart(5, '0') : number
}

export async function findExistingDeliveryNote(
    reference: string,
    businessYearCode: string,
): Promise<string | null> {
    const number = stripReferenceYear(reference)
    if (!number) return null
    const paddedNumber = deliveryNoteNumberFromInvoiceReference(reference)
    const candidates = new Set([paddedNumber, number])

    for (const candidate of candidates) {
        if (await fetchDeliveryNoteExists(candidate, businessYearCode)) {
            return candidate
        }
    }
    return null
}

type StoredInvoice = {
    deliveryNoteNumber?: string
    serviceDate?: string | null
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

export function storeInvoiceForDeliveryNote(draft: InvoiceDraft, deliveryNoteNumber: string) {
    const storedInvoice: StoredInvoice = {
        deliveryNoteNumber,
        serviceDate: dateForApi(draft.serviceDate),
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
