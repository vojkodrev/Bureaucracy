import { useEffect, useState } from 'react'
import type { PurchasePredictionPage } from '@/lib/purchase-prediction-types'
import { fetchPurchasePredictions } from '../purchase-prediction-search-api'
import type { PurchasePredictionSearchCriteria } from '../types'

type SearchResult = {
    searchKey: string
    page: PurchasePredictionPage | null
    error: string | null
}

export function usePurchasePredictionSearchResults(
    search: PurchasePredictionSearchCriteria,
    searchKey: string,
) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__',
        page: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        void fetchPurchasePredictions(search, controller.signal)
            .then((page) => setResult({ searchKey, page, error: null }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    page: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Purchase prediction search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    return { page: result.page, isLoading, error }
}
