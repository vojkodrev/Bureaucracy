import type { BankStatementInvoicePayment, BankStatementPage, MissingBankStatementDate } from '@/lib/bank-statement-types'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import { postGraphql } from '@/lib/graphql'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { BankStatementSearchCriteria } from './types'
import { bankStatementSearchToParams } from './bank-statement-search-params'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

type SearchBankStatementsResponse = {
    data?: { searchBankStatements: BankStatementPage }
}

type MissingBankStatementDatesResponse = {
    data?: { missingBankStatementDates: MissingBankStatementDate[] }
}

const searchBankStatementsQuery = `
    query SearchBankStatements(
        $businessYear: String!
        $dateFrom: Time
        $dateTo: Time
        $statementNumber: Int
        $documentNumber: String
        $reference: String
        $bankAccount: String
        $customerId: String
        $customerName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchBankStatements(
            businessYear: $businessYear
            dateFrom: $dateFrom
            dateTo: $dateTo
            statementNumber: $statementNumber
            documentNumber: $documentNumber
            reference: $reference
            bankAccount: $bankAccount
            customerId: $customerId
            customerName: $customerName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            entries {
                id statementId statementNumber paymentDate customerId customerName
                transactionType transactionTypeId outflow inflow documentNumber
            }
            totalCount page pageSize totalPages
        }
    }
`

const bankStatementInvoicePaymentsQuery = `
    query BankStatementInvoicePayments($businessYear: String!, $invoiceNumbers: [String!]!) {
        bankStatementInvoicePayments(
            businessYear: $businessYear
            invoiceNumbers: $invoiceNumbers
        ) {
            invoiceNumber paymentDate paidAmount
        }
    }
`

type BankStatementInvoicePaymentsResponse = {
    data?: { bankStatementInvoicePayments: BankStatementInvoicePayment[] }
}

const missingBankStatementDatesQuery = `
    query MissingBankStatementDates($businessYear: String!) {
        missingBankStatementDates(businessYear: $businessYear) {
            date
            isWeekend
        }
    }
`

function optionalStatementNumber(value: string): number | null {
    if (!value) return null
    const number = Number(value)
    return Number.isInteger(number) ? number : null
}

export async function fetchBankStatementSearch(
    search: BankStatementSearchCriteria,
    signal?: AbortSignal,
): Promise<BankStatementPage | null> {
    const result = await postGraphql<SearchBankStatementsResponse>(searchBankStatementsQuery, {
        businessYear: getSelectedBusinessYear(),
        dateFrom: optionalDate(search.from),
        dateTo: optionalDate(search.to),
        statementNumber: optionalStatementNumber(search.statementNumber),
        documentNumber: optionalFilter(search.documentNumber),
        reference: optionalFilter(search.reference),
        bankAccount: optionalFilter(search.bankAccount),
        customerId: optionalFilter(search.customerId),
        customerName: optionalFilter(search.customerName),
        sortBy: search.sortBy || null,
        sortDirection: search.sortDirection || null,
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(
            positiveInteger(search.pageSize, defaultPageSize),
            maximumPageSize,
        ),
    }, signal)
    return result.data?.searchBankStatements ?? null
}

export async function fetchMissingBankStatementDates(
    signal?: AbortSignal,
): Promise<MissingBankStatementDate[]> {
    const result = await postGraphql<MissingBankStatementDatesResponse>(
        missingBankStatementDatesQuery,
        { businessYear: getSelectedBusinessYear() },
        signal,
    )
    return result.data?.missingBankStatementDates ?? []
}

export async function fetchBankStatementInvoicePayments(
    invoiceNumbers: string[],
    signal?: AbortSignal,
): Promise<BankStatementInvoicePayment[]> {
    const result = await postGraphql<BankStatementInvoicePaymentsResponse>(
        bankStatementInvoicePaymentsQuery,
        { businessYear: getSelectedBusinessYear(), invoiceNumbers },
        signal,
    )
    return result.data?.bankStatementInvoicePayments ?? []
}

export function bankStatementReportPdfUrl(search: BankStatementSearchCriteria): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/bank-statements/report/pdf'
    url.search = bankStatementSearchToParams(search).toString()
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}
