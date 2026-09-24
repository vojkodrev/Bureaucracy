import { useEffect, useMemo, useState } from 'react'
import type { BankStatementEntry, BankStatementPage } from '@/lib/bank-statement-types'
import { fetchBankStatementSearch } from '../bank-statement-search-api'
import type { BankStatementSearchCriteria } from '../types'

type SearchResult = {
    searchKey: string
    statementPage: BankStatementPage | null
    error: string | null
}

export function useBankStatementSearchResults(
    search: BankStatementSearchCriteria,
    searchKey: string,
) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__',
        statementPage: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const statementPage = isLoading ? null : result.statementPage
    const error = isLoading ? null : result.error
    const groups = useMemo(() => {
        const grouped = new Map<number, BankStatementEntry[]>()
        for (const entry of statementPage?.entries ?? []) {
            const entries = grouped.get(entry.statementId) ?? []
            entries.push(entry)
            grouped.set(entry.statementId, entries)
        }
        return [...grouped.values()]
    }, [statementPage])

    useEffect(() => {
        const controller = new AbortController()
        void fetchBankStatementSearch(search, controller.signal)
            .then((nextPage) => {
                setResult({ searchKey, statementPage: nextPage, error: null })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    statementPage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Bank statement search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    return { statementPage, groups, isLoading, error }
}
