import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import type { InvoiceCustomerSummaryPage, InvoicePage } from '@/lib/invoice-types'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import { invoiceSearchToParams } from './invoice-search-params'
import type { InvoiceSearchCriteria } from './types'
import type { DocumentEmailFields } from '@/lib/document-email'

type SearchInvoicesResponse = {
    data?: { searchInvoices: InvoicePage }
    errors?: { message: string }[]
}

type SearchInvoicesByCustomerResponse = {
    data?: { searchInvoicesByCustomer: InvoiceCustomerSummaryPage }
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
                paidAmount
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

const searchInvoicesByCustomerQuery = `
    query SearchInvoicesByCustomer(
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
        searchInvoicesByCustomer(
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
            customerSummaries {
                customerCode
                customerName
                invoices {
                    invoiceNumber
                    customerCode
                    customerName
                    amount
                    paidAmount
                    issueDate
                    dueDate
                    paymentDate
                }
                totalPaid
                totalOutstanding
                totalOverdue
                totalInvoiced
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
    const groupByCustomer = search.resultsView === 'customer'
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
                sortBy: groupByCustomer ? 'customer' : search.sortBy || null,
                sortDirection: groupByCustomer ? 'asc' : search.sortDirection || null,
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

export async function fetchInvoiceSearchByCustomer(
    search: InvoiceSearchCriteria,
    signal?: AbortSignal,
): Promise<InvoiceCustomerSummaryPage | null> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: searchInvoicesByCustomerQuery,
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
                sortBy: 'customer',
                sortDirection: 'asc',
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

    const result = (await response.json()) as SearchInvoicesByCustomerResponse
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(', '))
    }
    return result.data?.searchInvoicesByCustomer ?? null
}

export function invoiceReportPdfUrl(search: InvoiceSearchCriteria): string {
    const url = new URL(graphqlUrl)
    const reportSearch = search.resultsView === 'customer'
        ? { ...search, sortBy: 'customer' as const, sortDirection: 'asc' as const }
        : search
    url.pathname = '/api/invoices/report/pdf'
    url.search = invoiceSearchToParams(reportSearch).toString()
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

export function invoiceRemindersPdfUrl(search: InvoiceSearchCriteria): string {
    const url = new URL(graphqlUrl)
    const reminderSearch = {
        ...search,
        paymentStatus: 'overdue' as const,
        resultsView: 'customer' as const,
        sortBy: 'customer' as const,
        sortDirection: 'asc' as const,
        page: '1',
        pageSize: '10000',
    }
    url.pathname = '/api/invoices/reminders/pdf'
    url.search = invoiceSearchToParams(reminderSearch).toString()
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

export async function sendInvoiceRemindersEmail(
    search: InvoiceSearchCriteria,
    fields: DocumentEmailFields,
): Promise<void> {
    const url = new URL(invoiceRemindersPdfUrl(search))
    url.pathname = '/api/invoices/reminders/email'
    url.searchParams.delete('_')
    const form = new FormData()
    form.set('recipient', fields.recipient)
    form.set('bcc', fields.bcc)
    form.set('subject', fields.subject)
    form.set('message', fields.message)
    fields.attachments.forEach((file) => form.append('attachments', file, file.name))
    const response = await fetch(url, { method: 'POST', body: form })
    const result = await response.json() as { error?: string }
    if (!response.ok) throw new Error(result.error || `Sending email failed (${response.status})`)
}
