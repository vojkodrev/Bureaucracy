import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import {
    inventoryItemSearchFromParams,
    inventoryItemSearchToParams,
} from '../inventory-item-search-params'
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from '../types'

export function useInventoryItemSearchState(similarName?: string) {
    const [params, setParams] = useSearchParams()
    const search = useMemo(() => inventoryItemSearchFromParams(params), [params])
    const searchKey = useMemo(
        () => new URLSearchParams({ ...search, similarName: similarName ?? '' }).toString(),
        [search, similarName],
    )

    function updateSearch(nextSearch: InventoryItemSearchCriteria) {
        setParams(inventoryItemSearchToParams(nextSearch))
    }

    function clearSearch() {
        setParams({})
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
