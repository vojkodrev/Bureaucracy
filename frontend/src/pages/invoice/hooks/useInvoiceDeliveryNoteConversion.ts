import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { storeInvoiceForDeliveryNote } from '../invoice-delivery-note-conversion'
import type { InvoiceDraft } from './useInvoiceDraft'

type Options = {
    draft: InvoiceDraft
    navigate: NavigateFunction
    allowNavigation: () => void
}

export function useInvoiceDeliveryNoteConversion({ draft, navigate, allowNavigation }: Options) {
    const [error, setError] = useState<string | null>(null)

    const convertToDeliveryNote = () => {
        try {
            storeInvoiceForDeliveryNote(draft)
            setError(null)
            allowNavigation()
            navigate('/delivery-note')
        } catch (conversionError: unknown) {
            setError(conversionError instanceof Error
                ? conversionError.message : 'Preparing the delivery note draft failed')
        }
    }

    return { convertToDeliveryNote, error }
}
