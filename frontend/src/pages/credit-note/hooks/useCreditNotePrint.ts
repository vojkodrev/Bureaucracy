import { useState } from 'react'
import { openAuthenticatedUrl } from '@/lib/auth'
import { creditNotePdfUrl } from '../credit-note-api'

type Options = {
    creditNoteId: number | null
    number: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    loadError: string | null
    isSaving: boolean
}

export function useCreditNotePrint(options: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const canPrint = options.creditNoteId != null &&
        Boolean(options.number.trim()) &&
        !options.hasUnsavedChanges &&
        !options.isLoading &&
        !options.loadError &&
        !options.isSaving

    async function printCreditNote() {
        if (!canPrint) return
        try {
            await openAuthenticatedUrl(creditNotePdfUrl(options.number.trim()))
            setPrintError(null)
        } catch (reason: unknown) {
            setPrintError(reason instanceof Error
                ? reason.message
                : 'Could not open the credit note PDF.')
        }
    }

    return { canPrint, printCreditNote, printError, setPrintError }
}
