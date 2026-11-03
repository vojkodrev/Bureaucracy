import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import {
    getSelectedBusinessYear,
    setSelectedBusinessYear,
} from '@/lib/business-year'
import { fetchCurrentBusinessYear } from '@/lib/business-year-api'
import { toast } from '@/lib/toast'
import { fetchNextDeliveryNoteNumber } from '@/pages/delivery-note-search/delivery-note-search-api'
import type { DeliveryNoteDraft } from './useDeliveryNoteDraft'
import type { DeliveryNoteRequestErrors } from './useDeliveryNoteLoader'

type Options = {
    deliveryNoteId: number | null
    businessYear: number | null
    draft: DeliveryNoteDraft
    hasUnsavedChanges: boolean
    navigate: NavigateFunction
    replaceDraft: (draft: DeliveryNoteDraft) => void
    markUnsaved: () => void
    setDeliveryNoteId: (id: number | null) => void
    setBusinessYear: (year: number | null) => void
    setRequestErrors: React.Dispatch<
        React.SetStateAction<DeliveryNoteRequestErrors>
    >
    preserveDuplicateDraft: () => void
    allowNavigation: () => void
}

export function useDeliveryNoteDuplicate(options: Options) {
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)

    const performDuplicate = async () => {
        if (options.deliveryNoteId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        options.setRequestErrors((current) => ({
            ...current,
            currentBusinessYear: undefined,
            duplicateNumber: undefined,
        }))
        try {
            const currentYear = await fetchCurrentBusinessYear()
            const number = await fetchNextDeliveryNoteNumber(
                undefined,
                currentYear.code,
            )
            if (
                options.businessYear !== currentYear.year
                || currentYear.code !== getSelectedBusinessYear()
            ) {
                setSelectedBusinessYear(currentYear.code)
                options.setBusinessYear(currentYear.year)
            }
            const now = new Date()
            const duplicate: DeliveryNoteDraft = {
                ...options.draft,
                deliveryNoteNumber: number,
                issueDate: now,
                deliveryDate: now,
                items: options.draft.items.map((item, index) => ({
                    ...item,
                    id: -index - 1,
                })),
            }
            options.setDeliveryNoteId(null)
            options.replaceDraft(duplicate)
            options.markUnsaved()
            options.preserveDuplicateDraft()
            options.allowNavigation()
            options.navigate('/delivery-note')
            toast.add({
                title: 'Delivery note duplicated',
                description: `Number ${number} was assigned to the unsaved copy.`,
                type: 'info',
            })
        } catch (error: unknown) {
            options.setRequestErrors((current) => ({
                ...current,
                currentBusinessYear: error instanceof Error
                    ? error.message
                    : 'Duplicating delivery note failed',
            }))
        } finally {
            setIsDuplicating(false)
        }
    }

    const duplicate = async () => {
        if (options.deliveryNoteId == null || isDuplicating) return
        if (options.hasUnsavedChanges) {
            setConfirmingDuplicate(true)
            return
        }
        await performDuplicate()
    }

    return {
        duplicate,
        performDuplicate,
        isDuplicating,
        confirmingDuplicate,
        setConfirmingDuplicate,
    }
}
