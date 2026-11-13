import type { InvoiceItem } from '@/lib/invoice-types'
import type { DeliveryNoteDraft } from './hooks/useDeliveryNoteDraft'

const storageKey = 'deliveryNoteToInvoice'

export type StoredDeliveryNote = {
    deliveryNoteNumber: string
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

export function storeDeliveryNoteForInvoice(
    draft: DeliveryNoteDraft,
    businessYear: number | null,
) {
    if (businessYear == null) {
        throw new Error('The delivery note business year is not available')
    }
    const number = draft.deliveryNoteNumber.trim()
    const normalizedNumber = /^\d+$/.test(number)
        ? number.replace(/^0+(?=\d)/, '')
        : number
    const storedNote: StoredDeliveryNote = {
        deliveryNoteNumber: `${normalizedNumber}/${businessYear}`,
        customerId: draft.customerId,
        customerName: draft.customerName,
        customerAddress: draft.customerAddress,
        customerPostalCode: draft.customerPostalCode,
        customerCity: draft.customerCity,
        customerCountry: draft.customerCountry,
        introductoryText: draft.introductoryText,
        closingText: draft.closingText,
        items: draft.items,
    }
    localStorage.setItem(storageKey, JSON.stringify(storedNote))
}

export function takeDeliveryNoteForInvoice(): StoredDeliveryNote | null {
    const value = localStorage.getItem(storageKey)
    if (!value) return null
    localStorage.removeItem(storageKey)
    try {
        return JSON.parse(value) as StoredDeliveryNote
    } catch {
        return null
    }
}
