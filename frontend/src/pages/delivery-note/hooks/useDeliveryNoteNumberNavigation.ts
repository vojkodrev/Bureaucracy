import { useEffect, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { fetchLatestDeliveryNoteNumber } from '@/pages/delivery-note-search/delivery-note-search-api'

export function useDeliveryNoteNumberNavigation(
    routeNumber: string | undefined,
    navigate: NavigateFunction,
) {
    const [result, setResult] = useState<{
        routeNumber?: string
        value?: string
        error?: string
    }>({})

    useEffect(() => {
        const controller = new AbortController()
        void fetchLatestDeliveryNoteNumber(controller.signal)
            .then((value) => setResult({ routeNumber, value }))
            .catch((error: unknown) => {
                const aborted = error instanceof DOMException
                    && error.name === 'AbortError'
                if (!aborted) {
                    setResult({
                        routeNumber,
                        error: error instanceof Error
                            ? error.message
                            : 'Loading latest delivery note failed',
                    })
                }
            })
        return () => controller.abort()
    }, [routeNumber])

    const currentValue = routeNumber && /^\d+$/.test(routeNumber)
        ? Number.parseInt(routeNumber, 10)
        : null
    const latest = result.routeNumber === routeNumber
        ? result.value
        : undefined
    const latestValue = latest && /^\d+$/.test(latest)
        ? Number.parseInt(latest, 10)
        : null
    const navigateTo = (value: number) => {
        if (!routeNumber) return
        const number = String(value).padStart(routeNumber.length, '0')
        navigate(`/delivery-note/${encodeURIComponent(number)}`)
    }

    return {
        canNavigatePrevious: currentValue != null && currentValue > 1,
        canNavigateNext: currentValue != null
            && latestValue != null
            && currentValue < latestValue,
        navigatePrevious: () => {
            if (currentValue != null) navigateTo(currentValue - 1)
        },
        navigateNext: () => {
            if (currentValue != null) navigateTo(currentValue + 1)
        },
        error: result.routeNumber === routeNumber
            ? result.error
            : undefined,
    }
}
