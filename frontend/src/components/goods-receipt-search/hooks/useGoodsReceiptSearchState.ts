import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ComponentMode } from '@/lib/component-mode'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import { goodsReceiptSearchFromParams, goodsReceiptSearchToParams } from '../goods-receipt-search-params'
import type { GoodsReceiptSearchCriteria, GoodsReceiptSortColumn } from '../types'

export function useGoodsReceiptSearchState(mode: ComponentMode, defaultProductCode?: string) {
    const [params, setParams] = useSearchParams()
    const pageSearch = useMemo(() => goodsReceiptSearchFromParams(params), [params])
    const initialDialogSearch = () => ({
        ...goodsReceiptSearchFromParams(new URLSearchParams()),
        productCode: defaultProductCode ?? '',
    })
    const [dialogSearch, setDialogSearch] = useState<GoodsReceiptSearchCriteria>(initialDialogSearch)
    const search = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])
    const updateSearch = (next: GoodsReceiptSearchCriteria) => {
        if (mode === ComponentMode.Page) setParams(goodsReceiptSearchToParams(next))
        else setDialogSearch(next)
    }
    const clearSearch = () => {
        if (mode === ComponentMode.Page) setParams({})
        else setDialogSearch(initialDialogSearch())
    }
    const changePage = (page: number, pageSize?: number) => updateSearch({
        ...search, page: String(page), pageSize: String(pageSize ?? defaultPageSize),
    })
    const changePageSize = (pageSize: number) => updateSearch({ ...search, page: String(defaultPage), pageSize: String(pageSize) })
    const changeSort = (sortBy: GoodsReceiptSortColumn) => {
        const sortDirection = search.sortBy !== sortBy ? 'asc' : search.sortDirection === 'asc' ? 'desc' : ''
        updateSearch({ ...search, page: '1', sortBy: sortDirection ? sortBy : '', sortDirection })
    }
    return { search, searchKey, updateSearch, clearSearch, changePage, changePageSize, changeSort }
}
