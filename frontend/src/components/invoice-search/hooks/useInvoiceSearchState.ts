import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ComponentMode } from '@/lib/component-mode'
import { defaultPageSize } from '@/lib/pagination'
import { invoiceSearchFromParams, invoiceSearchToParams } from '../invoice-search-params'
import type { InvoiceSearchCriteria, InvoiceSortColumn } from '../types'

export function useInvoiceSearchState(mode: ComponentMode) {
    const [searchParams, setSearchParams] = useSearchParams()
    const pageSearch = useMemo(() => invoiceSearchFromParams(searchParams), [searchParams])
    const [dialogSearch, setDialogSearch] = useState<InvoiceSearchCriteria>(() =>
        invoiceSearchFromParams(new URLSearchParams()),
    )
    const search = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])

    function updateSearch(nextSearch: InvoiceSearchCriteria) {
        if (mode === ComponentMode.Page) {
            setSearchParams(invoiceSearchToParams(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(invoiceSearchFromParams(new URLSearchParams()))
        }
    }

    function changePage(page: number, currentPageSize?: number) {
        updateSearch({
            ...search,
            page: String(page),
            pageSize: String(currentPageSize ?? defaultPageSize),
        })
    }

    function changePageSize(pageSize: number) {
        updateSearch({ ...search, page: '1', pageSize: String(pageSize) })
    }

    function changeSort(sortBy: InvoiceSortColumn) {
        const sortDirection = search.sortBy !== sortBy
            ? 'asc'
            : search.sortDirection === 'asc'
                ? 'desc'
                : ''
        updateSearch({
            ...search,
            page: '1',
            sortBy: sortDirection ? sortBy : '',
            sortDirection,
        })
    }

    return {
        search,
        searchKey,
        updateSearch,
        clearSearch,
        changePage,
        changePageSize,
        changeSort,
    }
}
