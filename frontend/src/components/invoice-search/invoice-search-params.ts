import { defaultPageSize } from '@/lib/pagination'
import type { InvoiceSearchCriteria, InvoiceSortColumn, PaymentStatus } from './types'
import { invoiceSortColumns, paymentStatuses } from './types'

export function invoiceSearchFromParams(searchParams: URLSearchParams): InvoiceSearchCriteria {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const paymentStatusValue = searchParams.get('paymentStatus')
    const sortBy = invoiceSortColumns.includes(sortByValue as InvoiceSortColumn)
        ? sortByValue as InvoiceSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        invoiceNumber: searchParams.get('invoiceNumber') ?? '',
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        paymentStatus: paymentStatuses.includes(paymentStatusValue as PaymentStatus)
            ? paymentStatusValue as PaymentStatus
            : 'all',
        page: searchParams.get('page') ?? '1',
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function invoiceSearchToParams(search: InvoiceSearchCriteria): URLSearchParams {
    const searchParams = new URLSearchParams()

    for (const key of [
        'invoiceNumber', 'customerId', 'customerName', 'productCode', 'productName', 'from', 'to',
    ] as const) {
        if (search[key]) searchParams.set(key, search[key])
    }
    if (search.paymentStatus !== 'all') {
        searchParams.set('paymentStatus', search.paymentStatus)
    }
    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}
