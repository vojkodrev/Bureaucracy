import type { BankStatementPage } from '@/lib/bank-statement-types'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import { postGraphql } from '@/lib/graphql'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { BankStatementSearchCriteria } from './types'

type SearchBankStatementsResponse = {
    data?: { searchBankStatements: BankStatementPage }
}

const searchBankStatementsQuery = `
    query SearchBankStatements(
        $businessYear: String!
        $dateFrom: Time
        $dateTo: Time
        $statementNumber: Int
        $documentNumber: String
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
