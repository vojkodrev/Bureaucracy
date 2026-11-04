import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InvoiceItem } from '@/lib/invoice-types'
import { sumCurrency } from '@/lib/numbers'

export type CreditNoteDraft = {
    creditNoteNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    issueDate?: Date
    serviceDate?: Date
    dueDate?: Date
    introductoryText: string
    closingText: string
    items: InvoiceItem[]
}

export const emptyCreditNoteDraft = (): CreditNoteDraft => ({
    creditNoteNumber: '',
    customerId: '',
    customerName: '',
    customerAddress: '',
    customerPostalCode: '',
    customerCity: '',
    customerCountry: '',
    issueDate: undefined,
    serviceDate: undefined,
    dueDate: undefined,
    introductoryText: '',
    closingText: '',
    items: [],
})

function serializeDraft(draft: CreditNoteDraft) {
    return JSON.stringify({
        ...draft,
        issueDate: draft.issueDate?.getTime() ?? null,
        serviceDate: draft.serviceDate?.getTime() ?? null,
        dueDate: draft.dueDate?.getTime() ?? null,
    })
}

export function useCreditNoteDraft() {
    const [draft, setDraft] = useState<CreditNoteDraft>(emptyCreditNoteDraft)
    const [cleanDraft, setCleanDraft] = useState<string | null>(null)
    const serializedDraft = useMemo(() => serializeDraft(draft), [draft])
    const setField = <K extends keyof CreditNoteDraft>(
        field: K,
        value: CreditNoteDraft[K],
    ) => setDraft((current) => ({ ...current, [field]: value }))
    const setItems: Dispatch<SetStateAction<InvoiceItem[]>> = (value) => {
        setDraft((current) => ({
            ...current,
            items: typeof value === 'function' ? value(current.items) : value,
        }))
    }
    const markClean = (value: CreditNoteDraft = draft) => {
        setCleanDraft(serializeDraft(value))
    }
    return {
        draft,
        setDraft,
        setField,
        setItems,
        markClean,
        clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft !== null && serializedDraft !== cleanDraft,
        totalIncludingVat: sumCurrency(draft.items.map((item) => item.grossAmount)),
    }
}
