import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { dateForApi } from '@/lib/dates'
import { emptyToNull } from '@/lib/form-input'
import { nextPaddedNumber, roundCurrency } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import {
    fetchDeliveryNoteExists,
    fetchLatestDeliveryNoteNumber,
    saveDeliveryNote,
} from '@/pages/delivery-note-search/delivery-note-search-api'
import type { DeliveryNoteNumberWarning } from '../DeliveryNoteNumberAlert'
import type { DeliveryNoteDraft } from './useDeliveryNoteDraft'

type Options = {
    deliveryNoteId: number | null
    draft: DeliveryNoteDraft
    routeNumber?: string
    isLoading: boolean
    loadError: string | null
    navigate: NavigateFunction
    markClean: (draft: DeliveryNoteDraft) => void
    allowNavigation: () => void
    reloadAfterSave: () => void
}

export function useDeliveryNoteSave(options: Options) {
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [numberWarning, setNumberWarning] = useState<
        DeliveryNoteNumberWarning | null
    >(null)
    const number = options.draft.deliveryNoteNumber.trim()
    const canSave = Boolean(number)
        && !options.isLoading
        && !options.loadError
        && (
            !options.routeNumber
            || options.deliveryNoteId != null
            || number !== options.routeNumber
        )

    const performSave = async () => {
        const creating = options.deliveryNoteId == null
        try {
            const draft = options.draft
            const result = await saveDeliveryNote({
                id: options.deliveryNoteId,
                deliveryNoteNumber: draft.deliveryNoteNumber.trim(),
                issueDate: dateForApi(draft.issueDate),
                deliveryDate: dateForApi(draft.deliveryDate),
                customerCode: emptyToNull(draft.customerId),
                customerName: emptyToNull(draft.customerName),
                customerAddress: emptyToNull(draft.customerAddress),
                customerCity: emptyToNull(draft.customerCity),
                introductoryText: emptyToNull(draft.introductoryText),
                closingText: emptyToNull(draft.closingText),
                withoutAmounts: draft.withoutAmounts,
                items: draft.items.map((item, index) => ({
                    id: item.id > 0 ? item.id : null,
                    sequence: index + 1,
                    productCode: item.productCode?.trim() ?? '',
                    taxCode: item.taxCode?.trim() ?? '',
                    quantity: item.quantity,
                    discount: item.discount,
                    netAmount: item.unitPrice == null
                        || item.quantity == null
                        ? null
                        : roundCurrency(item.unitPrice * item.quantity),
                    grossAmount: item.grossAmount == null
                        ? null
                        : roundCurrency(item.grossAmount),
                })),
            })
            const saved = result.data?.saveDeliveryNote
            if (!saved) {
                throw new Error('Saving returned no delivery note')
            }
            toast.add({
                title: 'Delivery note saved',
                description: `Delivery note ${saved.deliveryNoteNumber} was ${
                    creating ? 'created' : 'updated'
                } successfully.`,
                type: 'success',
            })
            options.markClean(draft)
            if (options.routeNumber === saved.deliveryNoteNumber) {
                options.reloadAfterSave()
            } else {
                options.allowNavigation()
                options.navigate(
                    `/delivery-note/${encodeURIComponent(
                        saved.deliveryNoteNumber,
                    )}`,
                )
            }
            return true
        } catch (error: unknown) {
            setSaveError(error instanceof Error
                ? error.message
                : 'Saving delivery note failed')
            return false
        }
    }

    const requestSave = async () => {
        if (!canSave || isSaving) return false
        setIsSaving(true)
        setSaveError(null)
        try {
            if (
                options.deliveryNoteId == null
                && await fetchDeliveryNoteExists(number)
            ) {
                setNumberWarning({ kind: 'duplicate' })
                return false
            }
            const latest = await fetchLatestDeliveryNoteNumber()
            if (number !== latest && number !== nextPaddedNumber(latest, 5)) {
                const numberValue = Number.parseInt(number, 10)
                const nextValue = Number.parseInt(
                    nextPaddedNumber(latest, 5),
                    10,
                )
                setNumberWarning({
                    kind: numberValue > nextValue
                        ? 'skipped'
                        : 'historical',
                    latestDeliveryNoteNumber: latest,
                })
                return false
            }
            return await performSave()
        } catch (error: unknown) {
            setSaveError(error instanceof Error
                ? error.message
                : 'Checking the latest delivery note failed')
            return false
        } finally {
            setIsSaving(false)
        }
    }

    const confirmSave = async () => {
        if (!canSave || isSaving) return false
        setNumberWarning(null)
        setIsSaving(true)
        setSaveError(null)
        try {
            return await performSave()
        } finally {
            setIsSaving(false)
        }
    }

    return {
        canSave,
        requestSave,
        confirmSave,
        isSaving,
        saveError,
        setSaveError,
        numberWarning,
        setNumberWarning,
    }
}
