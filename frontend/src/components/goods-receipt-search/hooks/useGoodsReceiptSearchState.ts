import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { defaultPageSize } from '@/lib/pagination'
import { goodsReceiptSearchFromParams, goodsReceiptSearchToParams } from '../goods-receipt-search-params'
import type { GoodsReceiptSearchCriteria, GoodsReceiptSortColumn } from '../types'

export function useGoodsReceiptSearchState() {
    const [params, setParams] = useSearchParams()
    const search = useMemo(() => goodsReceiptSearchFromParams(params), [params])
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])
    const updateSearch = (next: GoodsReceiptSearchCriteria) => setParams(goodsReceiptSearchToParams(next))
    const clearSearch = () => setParams({})
    const changePage = (page: number, pageSize?: number) => updateSearch({
        ...search, page: String(page), pageSize: String(pageSize ?? defaultPageSize),
    })
    const changePageSize = (pageSize: number) => updateSearch({ ...search, page: '1', pageSize: String(pageSize) })
    const changeSort = (sortBy: GoodsReceiptSortColumn) => {
        const sortDirection = search.sortBy !== sortBy ? 'asc' : search.sortDirection === 'asc' ? 'desc' : ''
        updateSearch({ ...search, page: '1', sortBy: sortDirection ? sortBy : '', sortDirection })
    }
    return { search, searchKey, updateSearch, clearSearch, changePage, changePageSize, changeSort }
}
