import { defaultPage, defaultPageSize } from '@/lib/pagination'
import type { BankStatementSearchCriteria } from './types'

export function bankStatementSearchFromParams(
    searchParams: URLSearchParams,
): BankStatementSearchCriteria {
    const sortBy = searchParams.get('sortBy') === 'date' ? 'date' : ''
    const sortDirectionValue = searchParams.get('sortDirection')
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        statementNumber: searchParams.get('statementNumber') ?? '',
        documentNumber: searchParams.get('documentNumber') ?? '',
        reference: searchParams.get('reference') ?? '',
        bankAccount: searchParams.get('bankAccount') ?? '',
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

export function bankStatementSearchToParams(
    search: BankStatementSearchCriteria,
): URLSearchParams {
    const searchParams = new URLSearchParams()
    for (const key of [
        'from',
        'to',
        'statementNumber',
        'documentNumber',
        'reference',
        'bankAccount',
        'customerId',
        'customerName',
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
