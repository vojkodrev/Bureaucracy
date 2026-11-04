import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { dateForApi } from '@/lib/dates'
import { emptyToNull } from '@/lib/form-input'
import { roundCurrency } from '@/lib/numbers'
import { postalCodeAndCity } from '@/lib/postal-address'
import { toast } from '@/lib/toast'
import { fetchCreditNoteExists, saveCreditNote } from '../credit-note-api'
import type { CreditNoteDraft } from './useCreditNoteDraft'

type Options = {
    creditNoteId: number | null
    draft: CreditNoteDraft
    routeNumber?: string
    isLoading: boolean
    loadError: string | null
    navigate: NavigateFunction
    markClean: (draft: CreditNoteDraft) => void
    reload: () => void
    allowNavigation: () => void
}

export function useCreditNoteSave(options: Options) {
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const canSave = Boolean(options.draft.creditNoteNumber.trim()) &&
        !options.isLoading && !options.loadError

    async function save() {
        if (!canSave || isSaving) return false
        setIsSaving(true)
        setSaveError(null)
        try {
            const number = options.draft.creditNoteNumber.trim()
            if (options.creditNoteId == null && await fetchCreditNoteExists(number)) {
                throw new Error(`Credit note ${number} already exists`)
            }
            const result = await saveCreditNote({
                id: options.creditNoteId,
                creditNoteNumber: number,
                issueDate: dateForApi(options.draft.issueDate),
                serviceDate: dateForApi(options.draft.serviceDate),
                dueDate: dateForApi(options.draft.dueDate),
                customerCode: emptyToNull(options.draft.customerId),
                customerName: emptyToNull(options.draft.customerName),
                customerAddress: emptyToNull(options.draft.customerAddress),
                customerCity: emptyToNull(postalCodeAndCity(
                    options.draft.customerPostalCode,
                    options.draft.customerCity,
                )),
                introductoryText: emptyToNull(options.draft.introductoryText),
                closingText: emptyToNull(options.draft.closingText),
                items: options.draft.items.map((item, index) => ({
                    id: item.id > 0 ? item.id : null,
                    sequence: index + 1,
                    productCode: item.productCode?.trim() ?? '',
                    taxCode: item.taxCode?.trim() ?? '',
                    quantity: item.quantity,
                    discount: item.discount,
                    netAmount: item.unitPrice == null || item.quantity == null
                        ? null
                        : roundCurrency(item.unitPrice * item.quantity),
                    grossAmount: item.grossAmount == null
                        ? null
                        : roundCurrency(item.grossAmount),
                    originalInvoiceNumber:
                        emptyToNull(item.originalInvoiceNumber ?? ''),
                })),
            })
            const saved = result.data?.saveCreditNote
            if (!saved) throw new Error('Saving returned no credit note')
            options.markClean(options.draft)
            toast.add({
                title: 'Credit note saved',
                description: `Credit note ${saved.creditNoteNumber} was saved successfully.`,
                type: 'success',
            })
            if (options.routeNumber === saved.creditNoteNumber) {
                options.reload()
            } else {
                options.allowNavigation()
                options.navigate(`/credit-note/${encodeURIComponent(saved.creditNoteNumber)}`)
            }
            return true
        } catch (reason: unknown) {
            setSaveError(reason instanceof Error ? reason.message : 'Saving credit note failed')
            return false
        } finally {
            setIsSaving(false)
        }
    }

    return { canSave, isSaving, saveError, setSaveError, save }
}
