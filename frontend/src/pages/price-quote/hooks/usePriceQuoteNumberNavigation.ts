import { useEffect, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { fetchLatestPriceQuoteNumber } from '@/pages/price-quote-search/price-quote-search-api'

export function usePriceQuoteNumberNavigation(
    routeQuoteNumber: string | undefined,
    navigate: NavigateFunction,
) {
    const [result, setResult] = useState<{
        routeQuoteNumber?: string; value?: string; error?: string
    }>({})

    useEffect(() => {
        const controller = new AbortController()
        void fetchLatestPriceQuoteNumber(controller.signal).then((value) => {
            setResult({ routeQuoteNumber, value })
        }).catch((error: unknown) => {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                setResult({
                    routeQuoteNumber,
                    error: error instanceof Error ? error.message : 'Loading latest price quote failed',
                })
            }
        })
        return () => controller.abort()
    }, [routeQuoteNumber])

    const currentValue = routeQuoteNumber && /^\d+$/.test(routeQuoteNumber)
        ? Number.parseInt(routeQuoteNumber, 10) : null
    const latest = result.routeQuoteNumber === routeQuoteNumber ? result.value : undefined
    const latestValue = latest && /^\d+$/.test(latest) ? Number.parseInt(latest, 10) : null
    const navigateTo = (value: number) => {
        if (!routeQuoteNumber) return
        navigate(`/price-quote/${encodeURIComponent(String(value).padStart(routeQuoteNumber.length, '0'))}`)
    }

    return {
        canNavigatePrevious: currentValue != null && currentValue > 1,
        canNavigateNext: currentValue != null && latestValue != null && currentValue < latestValue,
        navigatePrevious: () => { if (currentValue != null) navigateTo(currentValue - 1) },
        navigateNext: () => { if (currentValue != null) navigateTo(currentValue + 1) },
        latestPriceQuoteNumberError:
            result.routeQuoteNumber === routeQuoteNumber ? result.error : undefined,
    }
}
