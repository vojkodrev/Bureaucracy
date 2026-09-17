import { defaultPageSize } from '@/lib/pagination'
import type { PriceQuoteSearchCriteria, PriceQuoteSortColumn } from './types'
import { priceQuoteSortColumns } from './types'

export function priceQuoteSearchFromParams(params: URLSearchParams): PriceQuoteSearchCriteria {
    const sortByValue = params.get('sortBy')
    const directionValue = params.get('sortDirection')
    const sortBy = priceQuoteSortColumns.includes(sortByValue as PriceQuoteSortColumn)
        ? sortByValue as PriceQuoteSortColumn : ''
    const sortDirection = directionValue === 'asc' || directionValue === 'desc' ? directionValue : ''
    return {
        quoteNumber: params.get('quoteNumber') ?? '',
        customerId: params.get('customerId') ?? '',
        customerName: params.get('customerName') ?? '',
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        from: params.get('from') ?? '',
        to: params.get('to') ?? '',
        page: params.get('page') ?? '1',
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function priceQuoteSearchToParams(search: PriceQuoteSearchCriteria): URLSearchParams {
    const params = new URLSearchParams()
    for (const key of ['quoteNumber', 'customerId', 'customerName', 'productCode', 'productName', 'from', 'to'] as const) {
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
