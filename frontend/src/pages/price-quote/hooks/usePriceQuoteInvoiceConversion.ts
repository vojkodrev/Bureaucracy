import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { storePriceQuoteForInvoice } from '../price-quote-invoice-conversion'
import type { PriceQuoteDraft } from './usePriceQuoteDraft'

type Options = {
    draft: PriceQuoteDraft
    navigate: NavigateFunction
    allowNavigation: () => void
}

export function usePriceQuoteInvoiceConversion({ draft, navigate, allowNavigation }: Options) {
    const [error, setError] = useState<string | null>(null)

    const convertToInvoice = () => {
        try {
            storePriceQuoteForInvoice(draft)
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
