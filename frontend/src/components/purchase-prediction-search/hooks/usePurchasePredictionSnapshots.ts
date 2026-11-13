import { useEffect, useState } from 'react'
import type { PurchasePredictionSnapshot } from '@/lib/purchase-prediction-types'
import { fetchPurchasePredictionSnapshots } from '../purchase-prediction-search-api'

export function usePurchasePredictionSnapshots() {
    const [snapshots, setSnapshots] = useState<PurchasePredictionSnapshot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        void fetchPurchasePredictionSnapshots(controller.signal)
            .then((nextSnapshots) => {
                setSnapshots(nextSnapshots)
                setError(null)
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setError(requestError instanceof Error
                    ? requestError.message
                    : 'Purchase prediction snapshots could not be loaded')
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false)
            })
        return () => controller.abort()
    }, [])

    return { snapshots, isLoading, error }
}
