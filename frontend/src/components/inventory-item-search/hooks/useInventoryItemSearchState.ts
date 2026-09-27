import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ComponentMode } from '@/lib/component-mode'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import {
    inventoryItemSearchFromParams,
    inventoryItemSearchToParams,
} from '../inventory-item-search-params'
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from '../types'

export function useInventoryItemSearchState(mode: ComponentMode, similarName?: string) {
    const [params, setParams] = useSearchParams()
    const pageSearch = useMemo(() => inventoryItemSearchFromParams(params), [params])
    const [dialogSearch, setDialogSearch] = useState<InventoryItemSearchCriteria>(() =>
        inventoryItemSearchFromParams(new URLSearchParams()),
    )
    const search = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(
        () => new URLSearchParams({ ...search, similarName: similarName ?? '' }).toString(),
        [search, similarName],
    )

    function updateSearch(nextSearch: InventoryItemSearchCriteria) {
        if (mode === ComponentMode.Page) {
            setParams(inventoryItemSearchToParams(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        if (mode === ComponentMode.Page) {
            setParams({})
        } else {
            setDialogSearch(inventoryItemSearchFromParams(new URLSearchParams()))
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
        updateSearch({ ...search, page: String(defaultPage), pageSize: String(pageSize) })
    }

    function changeSort(sortBy: InventoryItemSortColumn) {
        const sortDirection = search.sortBy !== sortBy
            ? 'asc'
            : search.sortDirection === 'asc'
                ? 'desc'
                : ''
        updateSearch({
            ...search,
            page: String(defaultPage),
            sortBy: sortDirection ? sortBy : '',
            sortDirection,
        })
    }

    return { search, searchKey, updateSearch, clearSearch, changePage, changePageSize, changeSort }
}
