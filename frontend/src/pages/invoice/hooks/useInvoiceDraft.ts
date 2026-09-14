import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InvoiceItem } from '@/lib/invoice-types'

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
    introductoryText: string
    closingText: string
    invoiceItems: InvoiceItem[]
}

export const emptyInvoiceDraft = (): InvoiceDraft => ({
    invoiceNumber: '', customerId: '', customerName: '', customerAddress: '',
    customerPostalCode: '', customerCity: '', customerCountry: '', invoiceDate: undefined,
    serviceDate: undefined, dueDate: undefined, paymentDate: undefined, paidAmount: '',
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
    const [cleanDraft, setCleanDraft] = useState<string | null>(null)
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
    const markClean = (value: InvoiceDraft = draft) => setCleanDraft(serializeInvoiceDraft(value))
    const markUnsaved = () => setCleanDraft('__unsaved__')

    return {
        draft, setDraft, setField, setItems, serializedDraft,
        markClean, markUnsaved, clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft !== null && serializedDraft !== cleanDraft,
        totalIncludingVat: draft.invoiceItems.reduce(
            (total, item) => total + (item.grossAmount ?? 0), 0,
        ),
    }
}
