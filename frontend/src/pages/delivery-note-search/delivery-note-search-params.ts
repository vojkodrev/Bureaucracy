import { defaultPage, defaultPageSize } from '@/lib/pagination'
import type {
    DeliveryNoteSearchCriteria,
    DeliveryNoteSortColumn,
} from './types'
import { deliveryNoteSortColumns } from './types'

export function deliveryNoteSearchFromParams(
    params: URLSearchParams,
): DeliveryNoteSearchCriteria {
    const sortByValue = params.get('sortBy') ?? ''
    const sortBy = deliveryNoteSortColumns.includes(
        sortByValue as DeliveryNoteSortColumn,
    ) ? sortByValue as DeliveryNoteSortColumn : ''
    const directionValue = params.get('sortDirection')
    const sortDirection = directionValue === 'asc' || directionValue === 'desc'
        ? directionValue
        : ''
    return {
        deliveryNoteNumber: params.get('deliveryNoteNumber') ?? '',
        customerId: params.get('customerId') ?? '',
        customerName: params.get('customerName') ?? '',
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        from: params.get('from') ?? '',
        to: params.get('to') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function deliveryNoteSearchToParams(
    search: DeliveryNoteSearchCriteria,
): URLSearchParams {
    const params = new URLSearchParams()
    const keys = [
        'deliveryNoteNumber',
        'customerId',
        'customerName',
        'productCode',
        'productName',
        'from',
        'to',
    ] as const
    for (const key of keys) {
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
