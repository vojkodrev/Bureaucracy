import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InvoiceItem } from '@/lib/invoice-types'

export type PriceQuoteDraft = {
    quoteNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    issueDate?: Date
    dueDate?: Date
    introductoryText: string
    closingText: string
    items: InvoiceItem[]
}

export const emptyPriceQuoteDraft = (): PriceQuoteDraft => ({
    quoteNumber: '', customerId: '', customerName: '', customerAddress: '',
    customerPostalCode: '', customerCity: '', customerCountry: '',
    issueDate: undefined, dueDate: undefined, introductoryText: '', closingText: '', items: [],
})

export function serializePriceQuoteDraft(draft: PriceQuoteDraft): string {
    return JSON.stringify({
        ...draft,
        issueDate: draft.issueDate?.getTime() ?? null,
        dueDate: draft.dueDate?.getTime() ?? null,
    })
}

export function usePriceQuoteDraft() {
    const [draft, setDraft] = useState<PriceQuoteDraft>(emptyPriceQuoteDraft)
    const [cleanDraft, setCleanDraft] = useState<string | null>(null)
    const serializedDraft = useMemo(() => serializePriceQuoteDraft(draft), [draft])
    const setField = <K extends keyof PriceQuoteDraft>(field: K, value: PriceQuoteDraft[K]) =>
        setDraft((current) => ({ ...current, [field]: value }))
    const setItems: Dispatch<SetStateAction<InvoiceItem[]>> = (value) => {
        setDraft((current) => ({
            ...current,
            items: typeof value === 'function' ? value(current.items) : value,
        }))
    }
    const markClean = (value: PriceQuoteDraft = draft) =>
        setCleanDraft(serializePriceQuoteDraft(value))

    return {
        draft, setDraft, setField, setItems, serializedDraft, markClean,
        markUnsaved: () => setCleanDraft('__unsaved__'),
        clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft !== null && serializedDraft !== cleanDraft,
        totalIncludingVat: draft.items.reduce((total, item) => total + (item.grossAmount ?? 0), 0),
    }
}
