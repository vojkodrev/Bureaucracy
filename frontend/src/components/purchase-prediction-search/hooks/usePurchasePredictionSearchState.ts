import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import type { PurchasePredictionSearchCriteria } from '../types'

function fromParams(params: URLSearchParams): PurchasePredictionSearchCriteria {
    return {
        snapshotId: params.get('snapshotId') ?? '',
        customerCode: params.get('customerCode') ?? '',
        customerName: params.get('customerName') ?? '',
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
    }
}

function toParams(search: PurchasePredictionSearchCriteria) {
    const params = new URLSearchParams()
    for (const key of [
        'snapshotId',
        'customerCode',
        'customerName',
        'productCode',
        'productName',
    ] as const) {
        if (search[key]) params.set(key, search[key])
    }
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
    return params
}

export function usePurchasePredictionSearchState() {
    const [params, setParams] = useSearchParams()
    const search = useMemo(() => fromParams(params), [params])
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])

    function updateSearch(nextSearch: PurchasePredictionSearchCriteria) {
        setParams(toParams(nextSearch))
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

    return { search, searchKey, updateSearch, clearSearch, changePage, changePageSize }
}
