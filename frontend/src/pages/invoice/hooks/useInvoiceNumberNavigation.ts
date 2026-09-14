import { useEffect, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { fetchLatestInvoiceNumber } from '../invoice-api'

export function useInvoiceNumberNavigation(
    routeInvoiceNumber: string | undefined,
    navigate: NavigateFunction,
) {
    const [result, setResult] = useState<{
        routeInvoiceNumber?: string; value?: string; error?: string
    }>({})

    useEffect(() => {
        const controller = new AbortController()
        void fetchLatestInvoiceNumber(controller.signal).then((value) => {
            setResult({ routeInvoiceNumber, value })
        }).catch((error: unknown) => {
            if (!(error instanceof DOMException && error.name === 'AbortError')) {
                setResult({
                    routeInvoiceNumber,
                    error: error instanceof Error ? error.message : 'Loading latest invoice failed',
                })
            }
        })
        return () => controller.abort()
    }, [routeInvoiceNumber])

    const currentValue = routeInvoiceNumber && /^\d+$/.test(routeInvoiceNumber)
        ? Number.parseInt(routeInvoiceNumber, 10) : null
    const latest = result.routeInvoiceNumber === routeInvoiceNumber ? result.value : undefined
    const latestValue = latest && /^\d+$/.test(latest) ? Number.parseInt(latest, 10) : null
    const navigateTo = (value: number) => {
        if (!routeInvoiceNumber) return
        const number = String(value).padStart(routeInvoiceNumber.length, '0')
        navigate(`/invoice/${encodeURIComponent(number)}`)
    }

    return {
        canNavigatePrevious: currentValue != null && currentValue > 1,
        canNavigateNext: currentValue != null && latestValue != null && currentValue < latestValue,
        navigatePrevious: () => { if (currentValue != null) navigateTo(currentValue - 1) },
        navigateNext: () => { if (currentValue != null) navigateTo(currentValue + 1) },
        latestInvoiceNumberError: result.routeInvoiceNumber === routeInvoiceNumber ? result.error : undefined,
    }
}
