import { useState, type Dispatch, type SetStateAction } from 'react'
import { fetchNextDeliveryNoteNumber } from '@/pages/delivery-note-search/delivery-note-search-api'
import type { DeliveryNoteDraft } from './useDeliveryNoteDraft'
import type { DeliveryNoteRequestErrors } from './useDeliveryNoteLoader'

type Options = {
    deliveryNoteNumber: string
    disabled: boolean
    setDraft: Dispatch<SetStateAction<DeliveryNoteDraft>>
    setRequestErrors: Dispatch<SetStateAction<DeliveryNoteRequestErrors>>
}

export function useDeliveryNoteNumberRefresh({
    deliveryNoteNumber,
    disabled,
    setDraft,
    setRequestErrors,
}: Options) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const canRefresh = !disabled && !isRefreshing

    const refresh = async () => {
        if (!canRefresh) return
        setIsRefreshing(true)
        setRequestErrors((current) => ({ ...current, nextNumber: undefined }))
        try {
            const number = await fetchNextDeliveryNoteNumber()
            setDraft((current) => current.deliveryNoteNumber === deliveryNoteNumber
                ? { ...current, deliveryNoteNumber: number }
                : current)
        } catch (error) {
            setRequestErrors((current) => ({
                ...current,
                nextNumber: error instanceof Error
                    ? error.message
                    : 'Loading next delivery note number failed',
            }))
        } finally {
            setIsRefreshing(false)
        }
    }

    return { refresh, canRefresh, isRefreshing }
}
