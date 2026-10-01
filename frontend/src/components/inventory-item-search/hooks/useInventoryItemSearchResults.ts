import { useEffect, useState } from 'react'
import type { InventoryItem, InventoryItemPage } from '@/lib/inventory-item-types'
import { fetchInventoryItemSearch } from '../inventory-item-search-api'
import type { InventoryItemSearchCriteria } from '../types'

const emptyItems: InventoryItem[] = []

type SearchResult = {
    searchKey: string
    itemPage: InventoryItemPage | null
    error: string | null
}

export function useInventoryItemSearchResults(
    search: InventoryItemSearchCriteria,
    searchKey: string,
    similarName?: string,
) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__', itemPage: null, error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const itemPage = isLoading ? null : result.itemPage
    const items = itemPage?.items ?? emptyItems
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        void fetchInventoryItemSearch(search, similarName, controller.signal)
            .then((nextPage) => setResult({ searchKey, itemPage: nextPage, error: null }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    itemPage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Inventory item search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey, similarName])

    return { itemPage, items, isLoading, error }
}
