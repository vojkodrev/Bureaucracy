import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { storeInvoiceForCreditNote } from '../invoice-credit-note-conversion'
import type { InvoiceDraft } from './useInvoiceDraft'

type Options = {
    draft: InvoiceDraft
    navigate: NavigateFunction
    allowNavigation: () => void
}

export function useInvoiceCreditNoteConversion({
    draft,
    navigate,
    allowNavigation,
}: Options) {
    const [error, setError] = useState<string | null>(null)

    const convertToCreditNote = () => {
        try {
            storeInvoiceForCreditNote(draft)
            setError(null)
            allowNavigation()
            navigate('/credit-note')
        } catch (conversionError: unknown) {
            setError(conversionError instanceof Error
                ? conversionError.message
                : 'Preparing the credit note draft failed')
        }
    }

    return { convertToCreditNote, error }
}
