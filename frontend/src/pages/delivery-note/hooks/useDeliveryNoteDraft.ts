import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { InvoiceItem } from '@/lib/invoice-types'
import { sumCurrency } from '@/lib/numbers'

export type DeliveryNoteDraft = {
    deliveryNoteNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    issueDate?: Date
    deliveryDate?: Date
    introductoryText: string
    closingText: string
    withoutAmounts: boolean
    items: InvoiceItem[]
}

export const emptyDeliveryNoteDraft = (): DeliveryNoteDraft => ({
    deliveryNoteNumber: '',
    customerId: '',
    customerName: '',
    customerAddress: '',
    customerPostalCode: '',
    customerCity: '',
    customerCountry: '',
    issueDate: undefined,
    deliveryDate: undefined,
    introductoryText: '',
    closingText: '',
    withoutAmounts: false,
    items: [],
})

function serialize(draft: DeliveryNoteDraft): string {
    return JSON.stringify({
        ...draft,
        issueDate: draft.issueDate?.getTime() ?? null,
        deliveryDate: draft.deliveryDate?.getTime() ?? null,
    })
}

export function useDeliveryNoteDraft() {
    const [draft, setDraft] = useState<DeliveryNoteDraft>(
        emptyDeliveryNoteDraft,
    )
    const [cleanDraft, setCleanDraft] = useState<string | null>(null)
    const serialized = useMemo(() => serialize(draft), [draft])
    const setField = <K extends keyof DeliveryNoteDraft>(
        field: K,
        value: DeliveryNoteDraft[K],
    ) => setDraft((current) => ({ ...current, [field]: value }))
    const setItems: Dispatch<SetStateAction<InvoiceItem[]>> = (value) => {
        setDraft((current) => ({
            ...current,
            items: typeof value === 'function'
                ? value(current.items)
                : value,
        }))
    }
    const markClean = (value: DeliveryNoteDraft = draft) => {
        setCleanDraft(serialize(value))
    }
    return {
        draft,
        setDraft,
        setField,
        setItems,
        markClean,
        markUnsaved: () => setCleanDraft('__unsaved__'),
        clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft !== null && serialized !== cleanDraft,
        totalIncludingVat: sumCurrency(
            draft.items.map((item) => item.grossAmount),
        ),
    }
}
