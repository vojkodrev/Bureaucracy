import { useEffect, useState } from 'react'
import type {
    Invoice,
    InvoiceCustomerSummaryPage,
    InvoicePage,
} from '@/lib/invoice-types'
import { fetchInvoiceSearch, fetchInvoiceSearchByCustomer } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

const emptyInvoices: Invoice[] = []

type SearchResult = {
    searchKey: string
    invoicePage: InvoicePage | null
    customerSummaryPage: InvoiceCustomerSummaryPage | null
    error: string | null
}

export function useInvoiceSearchResults(search: InvoiceSearchCriteria, searchKey: string) {
    const [result, setResult] = useState<SearchResult>({
        searchKey: '__initial__',
        invoicePage: null,
        customerSummaryPage: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const invoicePage = isLoading ? null : result.invoicePage
    const customerSummaryPage = isLoading ? null : result.customerSummaryPage
    const invoices = invoicePage?.invoices
        ?? customerSummaryPage?.customerSummaries.flatMap(({ invoices }) => invoices)
        ?? emptyInvoices
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        const request = search.resultsView === 'customer'
            ? fetchInvoiceSearchByCustomer(search, controller.signal).then((nextPage) => ({
                invoicePage: null,
                customerSummaryPage: nextPage,
            }))
            : fetchInvoiceSearch(search, controller.signal).then((nextPage) => ({
                invoicePage: nextPage,
                customerSummaryPage: null,
            }))
        void request
            .then((nextResult) => {
                setResult({ searchKey, ...nextResult, error: null })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    invoicePage: null,
                    customerSummaryPage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Invoice search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    return { invoicePage, customerSummaryPage, invoices, isLoading, error }
}
