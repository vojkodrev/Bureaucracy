import { defaultPageSize } from '@/lib/pagination'
import type { CreditNoteSearchCriteria, CreditNoteSortColumn } from './types'
import { creditNoteSortColumns } from './types'

export function creditNoteSearchFromParams(
    searchParams: URLSearchParams,
): CreditNoteSearchCriteria {
    const sortByValue = searchParams.get('sortBy')
    const directionValue = searchParams.get('sortDirection')
    const sortBy = creditNoteSortColumns.includes(sortByValue as CreditNoteSortColumn)
        ? sortByValue as CreditNoteSortColumn
        : ''
    const sortDirection = directionValue === 'asc' || directionValue === 'desc'
        ? directionValue
        : ''
    return {
        creditNoteNumber: searchParams.get('creditNoteNumber') ?? '',
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        originalInvoiceNumber: searchParams.get('originalInvoiceNumber') ?? '',
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        page: searchParams.get('page') ?? '1',
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function creditNoteSearchToParams(search: CreditNoteSearchCriteria) {
    const searchParams = new URLSearchParams()
    for (const key of [
        'creditNoteNumber',
        'customerId',
        'customerName',
        'productCode',
        'productName',
        'originalInvoiceNumber',
        'from',
        'to',
    ] as const) {
        if (search[key]) searchParams.set(key, search[key])
    }
    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}
