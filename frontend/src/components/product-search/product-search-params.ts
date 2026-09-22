import { defaultPage, defaultPageSize } from '@/lib/pagination'
import { productSortColumns } from './product-search-columns'
import type { ProductSearchForm, ProductSortColumn } from './types'

export function productSearchFromParams(searchParams: URLSearchParams): ProductSearchForm {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const sortBy = productSortColumns.some(({ key }) => key === sortByValue)
        ? sortByValue as ProductSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function productSearchToParams(search: ProductSearchForm): URLSearchParams {
    const searchParams = new URLSearchParams()

    if (search.productCode) searchParams.set('productCode', search.productCode)
    if (search.productName) searchParams.set('productName', search.productName)
    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}
