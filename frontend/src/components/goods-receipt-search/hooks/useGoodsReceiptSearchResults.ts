import { useEffect, useState } from 'react'
import type { GoodsReceiptPage } from '@/lib/goods-receipt-types'
import { fetchGoodsReceiptSearch } from '../goods-receipt-search-api'
import type { GoodsReceiptSearchCriteria } from '../types'

type Result = { key: string; page: GoodsReceiptPage | null; error: string | null }

export function useGoodsReceiptSearchResults(search: GoodsReceiptSearchCriteria, searchKey: string) {
    const [result, setResult] = useState<Result>({ key: '__initial__', page: null, error: null })
    const isLoading = result.key !== searchKey
    useEffect(() => {
        const controller = new AbortController()
        void fetchGoodsReceiptSearch(search, controller.signal)
            .then((page) => setResult({ key: searchKey, page, error: null }))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return
                setResult({ key: searchKey, page: null, error: error instanceof Error ? error.message : 'Goods receipt search failed' })
            })
        return () => controller.abort()
    }, [search, searchKey])
    return { page: result.page, isLoading, error: isLoading ? null : result.error }
}
