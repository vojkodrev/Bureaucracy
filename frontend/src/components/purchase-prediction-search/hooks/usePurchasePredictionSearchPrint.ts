import { useEffect, useEffectEvent, useState } from 'react'
import { openAuthenticatedUrl } from '@/lib/auth'
import { purchasePredictionReportPdfUrl } from '../purchase-prediction-search-api'
import type { PurchasePredictionSearchCriteria } from '../types'

type Options = {
    search: PurchasePredictionSearchCriteria
    hasResults: boolean
    isLoading: boolean
    hasError: boolean
}

export function usePurchasePredictionSearchPrint({
    search,
    hasResults,
    isLoading,
    hasError,
}: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const canPrint = !isLoading && !hasError && hasResults

    const printReport = async () => {
        if (!canPrint) return
        try {
            await openAuthenticatedUrl(purchasePredictionReportPdfUrl(search))
            setPrintError(null)
        } catch (error) {
            setPrintError(error instanceof Error
                ? error.message
                : 'Could not open the purchase prediction report PDF.')
        }
    }
    const onPrintShortcut = useEffectEvent(printReport)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return
            event.preventDefault()
            onPrintShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return { canPrint, printReport, printError }
}
