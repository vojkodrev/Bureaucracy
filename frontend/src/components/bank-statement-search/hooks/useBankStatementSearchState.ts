import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import {
    bankStatementSearchFromParams,
    bankStatementSearchToParams,
} from '../bank-statement-search-params'
import type { BankStatementSearchCriteria } from '../types'

export function useBankStatementSearchState() {
    const [searchParams, setSearchParams] = useSearchParams()
    const search = useMemo(() => bankStatementSearchFromParams(searchParams), [searchParams])
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])

    function updateSearch(nextSearch: BankStatementSearchCriteria) {
        setSearchParams(bankStatementSearchToParams(nextSearch))
    }

    function clearSearch() {
        setSearchParams({})
    }

    function changePage(page: number, currentPageSize?: number) {
        updateSearch({
            ...search,
            page: String(page),
            pageSize: String(currentPageSize ?? defaultPageSize),
        })
    }

    function changePageSize(pageSize: number) {
        updateSearch({ ...search, page: String(defaultPage), pageSize: String(pageSize) })
    }

    function changeSort() {
        const sortDirection = search.sortBy !== 'date'
            ? 'asc'
            : search.sortDirection === 'asc'
                ? 'desc'
                : ''
        updateSearch({
            ...search,
            page: String(defaultPage),
            sortBy: sortDirection ? 'date' : '',
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
