import { defaultPage, defaultPageSize } from '@/lib/pagination'
import { inventoryItemSortColumns } from './inventory-item-search-columns'
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from './types'

export function inventoryItemSearchFromParams(
    params: URLSearchParams,
): InventoryItemSearchCriteria {
    const sortByValue = params.get('sortBy')
    const directionValue = params.get('sortDirection')
    const sortBy = inventoryItemSortColumns.some(({ key }) => key === sortByValue)
        ? sortByValue as InventoryItemSortColumn
        : ''
    const sortDirection = directionValue === 'asc' || directionValue === 'desc'
        ? directionValue
        : ''

    return {
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function inventoryItemSearchToParams(
    search: InventoryItemSearchCriteria,
): URLSearchParams {
    const params = new URLSearchParams()
    if (search.productCode) params.set('productCode', search.productCode)
    if (search.productName) params.set('productName', search.productName)
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        params.set('sortBy', search.sortBy)
        params.set('sortDirection', search.sortDirection)
    }
    return params
}
