import { defaultPageSize } from '@/lib/pagination'
import type { GoodsReceiptSearchCriteria, GoodsReceiptSortColumn } from './types'
import { goodsReceiptSortColumns } from './types'

export function goodsReceiptSearchFromParams(params: URLSearchParams): GoodsReceiptSearchCriteria {
    const sortByValue = params.get('sortBy')
    const sortDirectionValue = params.get('sortDirection')
    const sortBy = goodsReceiptSortColumns.includes(sortByValue as GoodsReceiptSortColumn)
        ? sortByValue as GoodsReceiptSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''
    return {
        from: params.get('from') ?? '',
        to: params.get('to') ?? '',
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        page: params.get('page') ?? '1',
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function goodsReceiptSearchToParams(search: GoodsReceiptSearchCriteria): URLSearchParams {
    const params = new URLSearchParams()
    for (const key of ['from', 'to', 'productCode', 'productName'] as const) {
        if (search[key]) params.set(key, search[key])
    }
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        params.set('sortBy', search.sortBy)
        params.set('sortDirection', search.sortDirection)
    }
    return params
}
