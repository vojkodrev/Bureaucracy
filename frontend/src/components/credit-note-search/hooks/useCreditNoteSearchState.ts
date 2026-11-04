import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ComponentMode } from '@/lib/component-mode'
import { defaultPageSize } from '@/lib/pagination'
import {
    creditNoteSearchFromParams,
    creditNoteSearchToParams,
} from '../credit-note-search-params'
import type { CreditNoteSearchCriteria, CreditNoteSortColumn } from '../types'

export function useCreditNoteSearchState(mode: ComponentMode) {
    const [searchParams, setSearchParams] = useSearchParams()
    const pageSearch = useMemo(
        () => creditNoteSearchFromParams(searchParams),
        [searchParams],
    )
    const [dialogSearch, setDialogSearch] = useState<CreditNoteSearchCriteria>(
        () => creditNoteSearchFromParams(new URLSearchParams()),
    )
    const search = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(
        () => creditNoteSearchToParams(search).toString(),
        [search],
    )

    function updateSearch(nextSearch: CreditNoteSearchCriteria) {
        if (mode === ComponentMode.Page) {
            setSearchParams(creditNoteSearchToParams(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(creditNoteSearchFromParams(new URLSearchParams()))
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

    function changeSort(sortBy: CreditNoteSortColumn) {
        const sortDirection = search.sortBy !== sortBy
            ? 'asc'
            : search.sortDirection === 'asc' ? 'desc' : ''
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
