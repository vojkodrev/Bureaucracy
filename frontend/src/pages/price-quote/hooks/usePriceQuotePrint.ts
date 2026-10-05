import { useState } from 'react'
import { priceQuotePdfUrl } from '@/pages/price-quote-search/price-quote-search-api'
import { openAuthenticatedUrl } from '@/lib/auth'

type Options = {
    priceQuoteId: number | null
    quoteNumber: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    loadError: string | null
    isSaving: boolean
    isDuplicating: boolean
    canSave: boolean
}

export function usePriceQuotePrint({
    priceQuoteId, quoteNumber, hasUnsavedChanges, isLoading, loadError,
    isSaving, isDuplicating, canSave,
}: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const [confirmingPrint, setConfirmingPrint] = useState(false)
    const canPrint = priceQuoteId != null && Boolean(quoteNumber.trim()) &&
        !hasUnsavedChanges && !isLoading && !loadError && !isSaving && !isDuplicating
    const canRequestPrint = Boolean(quoteNumber.trim()) && !isLoading &&
        !loadError && !isSaving && !isDuplicating

    const printPriceQuote = async () => {
        if (!canPrint) {
            if (canSave) setConfirmingPrint(true)
            return
        }
        try {
            await openAuthenticatedUrl(priceQuotePdfUrl(quoteNumber.trim()))
            setPrintError(null)
        } catch (error) {
            setPrintError(error instanceof Error ? error.message : 'Could not open the price quote PDF.')
        }
    }

    return {
        canPrint, canRequestPrint, printPriceQuote, printError, setPrintError,
        confirmingPrint, setConfirmingPrint,
    }
}
