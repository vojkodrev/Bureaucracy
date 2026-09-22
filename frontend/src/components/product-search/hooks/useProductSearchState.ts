import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ComponentMode } from '@/lib/component-mode'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import { productSearchFromParams, productSearchToParams } from '../product-search-params'
import type { ProductSearchForm, ProductSortColumn } from '../types'

export function useProductSearchState(mode: ComponentMode, similarName?: string) {
    const [searchParams, setSearchParams] = useSearchParams()
    const pageSearch = useMemo(() => productSearchFromParams(searchParams), [searchParams])
    const [dialogSearch, setDialogSearch] = useState<ProductSearchForm>(() =>
        productSearchFromParams(new URLSearchParams()),
    )
    const search = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(
        () => new URLSearchParams({ ...search, similarName: similarName ?? '' }).toString(),
        [search, similarName],
    )

    function updateSearch(nextSearch: ProductSearchForm) {
        if (mode === ComponentMode.Page) {
            setSearchParams(productSearchToParams(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(productSearchFromParams(new URLSearchParams()))
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

    function changeSort(sortBy: ProductSortColumn) {
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
