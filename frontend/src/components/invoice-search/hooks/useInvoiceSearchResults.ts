import { useEffect, useState } from 'react'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'
import { fetchInvoiceSearch } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

const emptyInvoices: Invoice[] = []

type SearchResult = {
    searchKey: string
    invoicePage: InvoicePage | null
    error: string | null
}

export function useInvoiceSearchResults(search: InvoiceSearchCriteria, searchKey: string) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__',
        invoicePage: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const invoicePage = isLoading ? null : result.invoicePage
    const invoices = invoicePage?.invoices ?? emptyInvoices
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        void fetchInvoiceSearch(search, controller.signal)
            .then((nextInvoicePage) => {
                setResult({ searchKey, invoicePage: nextInvoicePage, error: null })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    invoicePage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Invoice search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    return { invoicePage, invoices, isLoading, error }
}
