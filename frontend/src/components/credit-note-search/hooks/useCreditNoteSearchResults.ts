import { useEffect, useState } from 'react'
import type { CreditNotePage } from '@/pages/credit-note/types'
import { fetchCreditNoteSearch } from '../credit-note-search-api'
import type { CreditNoteSearchCriteria } from '../types'

type SearchResult = {
    searchKey: string
    creditNotePage: CreditNotePage | null
    error: string | null
}

export function useCreditNoteSearchResults(
    search: CreditNoteSearchCriteria,
    searchKey: string,
) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__',
        creditNotePage: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        void fetchCreditNoteSearch(search, controller.signal)
            .then((creditNotePage) => {
                setResult({ searchKey, creditNotePage, error: null })
            })
            .catch((requestError: unknown) => {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === 'AbortError'
                ) return
                setResult({
                    searchKey,
                    creditNotePage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Credit note search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    return {
        creditNotePage: result.creditNotePage,
        isLoading,
        error,
    }
}
