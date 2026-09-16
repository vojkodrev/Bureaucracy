import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import type { InvoicePage } from '@/lib/invoice-types'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import { invoiceSearchToParams } from './invoice-search-params'
import type { InvoiceSearchCriteria } from './types'

type SearchInvoicesResponse = {
    data?: { searchInvoices: InvoicePage }
    errors?: { message: string }[]
}

const searchInvoicesQuery = `
    query SearchInvoices(
        $businessYear: String!
        $invoiceNumber: String
        $customerId: String
        $customerName: String
        $productCode: String
        $productName: String
        $issuedFrom: Time
        $issuedTo: Time
        $paymentStatus: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchInvoices(
            businessYear: $businessYear
            invoiceNumber: $invoiceNumber
            customerId: $customerId
            customerName: $customerName
            productCode: $productCode
            productName: $productName
            issuedFrom: $issuedFrom
            issuedTo: $issuedTo
            paymentStatus: $paymentStatus
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            invoices {
                invoiceNumber
                customerCode
                customerName
                amount
                issueDate
                dueDate
                paymentDate
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function fetchInvoiceSearch(
    search: InvoiceSearchCriteria,
    signal?: AbortSignal,
): Promise<InvoicePage | null> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: searchInvoicesQuery,
            variables: {
                businessYear: getSelectedBusinessYear(),
                invoiceNumber: optionalFilter(search.invoiceNumber),
                customerId: optionalFilter(search.customerId),
                customerName: optionalFilter(search.customerName),
                productCode: optionalFilter(search.productCode),
                productName: optionalFilter(search.productName),
                issuedFrom: optionalDate(search.from),
                issuedTo: optionalDate(search.to),
                paymentStatus: search.paymentStatus,
                sortBy: search.sortBy || null,
                sortDirection: search.sortDirection || null,
                page: positiveInteger(search.page, defaultPage),
                pageSize: Math.min(
                    positiveInteger(search.pageSize, defaultPageSize),
                    maximumPageSize,
                ),
            },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Invoice search failed (${response.status})`)

    const result = (await response.json()) as SearchInvoicesResponse
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(', '))
    }
    return result.data?.searchInvoices ?? null
}

export function invoiceReportPdfUrl(search: InvoiceSearchCriteria): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/invoices/report/pdf'
    url.search = invoiceSearchToParams(search).toString()
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}
