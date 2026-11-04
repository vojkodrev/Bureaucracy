import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { storeDeliveryNoteForInvoice } from '../delivery-note-invoice-conversion'
import type { DeliveryNoteDraft } from './useDeliveryNoteDraft'

type Options = {
    draft: DeliveryNoteDraft
    businessYear: number | null
    navigate: NavigateFunction
    allowNavigation: () => void
}

export function useDeliveryNoteInvoiceConversion({
    draft, businessYear, navigate, allowNavigation,
}: Options) {
    const [error, setError] = useState<string | null>(null)

    const convertToInvoice = () => {
        try {
            storeDeliveryNoteForInvoice(draft, businessYear)
            setError(null)
            allowNavigation()
            navigate('/invoice')
        } catch (conversionError: unknown) {
            setError(conversionError instanceof Error
                ? conversionError.message : 'Preparing the invoice draft failed')
        }
    }

    return { convertToInvoice, error }
}
