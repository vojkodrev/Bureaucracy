import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InvoiceItem } from '@/lib/invoice-types'
import { sumCurrency } from '@/lib/numbers'

export type InvoiceDraft = {
    invoiceNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    invoiceDate?: Date
    serviceDate?: Date
    dueDate?: Date
    paymentDate?: Date
    paidAmount: string
    purchaseOrderNumber: string
    deliveryNoteNumber: string
    introductoryText: string
    closingText: string
    invoiceItems: InvoiceItem[]
}

export const emptyInvoiceDraft = (): InvoiceDraft => ({
    invoiceNumber: '', customerId: '', customerName: '', customerAddress: '',
    customerPostalCode: '', customerCity: '', customerCountry: '', invoiceDate: undefined,
    serviceDate: undefined, dueDate: undefined, paymentDate: undefined, paidAmount: '',
    purchaseOrderNumber: '', deliveryNoteNumber: '',
    introductoryText: '', closingText: '', invoiceItems: [],
})

export function serializeInvoiceDraft(draft: InvoiceDraft): string {
    return JSON.stringify({
        ...draft,
        invoiceDate: draft.invoiceDate?.getTime() ?? null,
        serviceDate: draft.serviceDate?.getTime() ?? null,
        dueDate: draft.dueDate?.getTime() ?? null,
        paymentDate: draft.paymentDate?.getTime() ?? null,
    })
}

export function useInvoiceDraft() {
    const [draft, setDraft] = useState<InvoiceDraft>(emptyInvoiceDraft)
    const [cleanDraft, setCleanDraft] = useState<InvoiceDraft | 'unsaved' | null>(null)
    const serializedDraft = useMemo(() => serializeInvoiceDraft(draft), [draft])

    const setField = <K extends keyof InvoiceDraft>(field: K, value: InvoiceDraft[K]) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }
    const setItems: Dispatch<SetStateAction<InvoiceItem[]>> = (value) => {
        setDraft((current) => ({
            ...current,
            invoiceItems: typeof value === 'function' ? value(current.invoiceItems) : value,
        }))
    }
    const markClean = (value: InvoiceDraft = draft) => setCleanDraft(value)
    const markClosingTextClean = (closingText: string) => {
        setCleanDraft((current) => current && current !== 'unsaved' && current === cleanDraft
            ? { ...current, closingText }
            : current)
    }
    const markUnsaved = () => setCleanDraft('unsaved')

    return {
        draft, setDraft, setField, setItems, serializedDraft,
        markClean, markClosingTextClean, markUnsaved, clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft === 'unsaved' ||
            (cleanDraft !== null && serializedDraft !== serializeInvoiceDraft(cleanDraft)),
        totalIncludingVat: sumCurrency(draft.invoiceItems.map((item) => item.grossAmount)),
    }
}
