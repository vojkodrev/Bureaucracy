import { useState } from 'react'
import { openAuthenticatedUrl } from '@/lib/auth'
import { deliveryNotePdfUrl } from '@/pages/delivery-note-search/delivery-note-search-api'

type Options = {
    deliveryNoteId: number | null
    deliveryNoteNumber: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    loadError: string | null
    isSaving: boolean
    isDuplicating: boolean
    canSave: boolean
}

export function useDeliveryNotePrint(options: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const [confirmingPrint, setConfirmingPrint] = useState(false)
    const ready = !options.isLoading
        && !options.loadError
        && !options.isSaving
        && !options.isDuplicating
    const hasNumber = Boolean(options.deliveryNoteNumber.trim())
    const canPrint = options.deliveryNoteId != null
        && hasNumber
        && !options.hasUnsavedChanges
        && ready
    const canRequestPrint = hasNumber && ready

    const printDeliveryNote = async () => {
        if (!canPrint) {
            if (options.canSave) setConfirmingPrint(true)
            return
        }
        try {
            await openAuthenticatedUrl(
                deliveryNotePdfUrl(options.deliveryNoteNumber.trim()),
            )
            setPrintError(null)
        } catch (error: unknown) {
            setPrintError(error instanceof Error
                ? error.message
                : 'Could not open the delivery note PDF.')
        }
    }

    return {
        canPrint,
        canRequestPrint,
        printDeliveryNote,
        printError,
        setPrintError,
        confirmingPrint,
        setConfirmingPrint,
    }
}
