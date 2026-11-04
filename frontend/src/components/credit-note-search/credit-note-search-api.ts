import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type { CreditNotePage } from '@/pages/credit-note/types'
import type { CreditNoteSearchCriteria } from './types'

const query = `query SearchCreditNotes(
    $businessYear: String!, $creditNoteNumber: String, $customerId: String,
    $customerName: String, $productCode: String, $productName: String,
    $originalInvoiceNumber: String, $issuedFrom: Time, $issuedTo: Time,
    $sortBy: String, $sortDirection: String, $page: Int, $pageSize: Int
) {
    searchCreditNotes(
        businessYear: $businessYear,
        creditNoteNumber: $creditNoteNumber,
        customerId: $customerId,
        customerName: $customerName,
        productCode: $productCode,
        productName: $productName,
        originalInvoiceNumber: $originalInvoiceNumber,
        issuedFrom: $issuedFrom,
        issuedTo: $issuedTo,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        page: $page,
        pageSize: $pageSize
    ) {
        creditNotes {
            id creditNoteNumber issueDate serviceDate dueDate customerCode
            customerName currency amount
        }
        totalCount page pageSize totalPages
    }
}`

const optional = (value: string) => value || null

export async function fetchCreditNoteSearch(
    search: CreditNoteSearchCriteria,
    signal?: AbortSignal,
): Promise<CreditNotePage> {
    const result = await postGraphql<{
        data?: { searchCreditNotes: CreditNotePage }
    }>(query, {
        businessYear: getSelectedBusinessYear(),
        creditNoteNumber: optional(search.creditNoteNumber),
        customerId: optional(search.customerId),
        customerName: optional(search.customerName),
        productCode: optional(search.productCode),
        productName: optional(search.productName),
        originalInvoiceNumber: optional(search.originalInvoiceNumber),
        issuedFrom: optional(search.from),
        issuedTo: optional(search.to),
        sortBy: optional(search.sortBy),
        sortDirection: optional(search.sortDirection),
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(
            positiveInteger(search.pageSize, defaultPageSize),
            maximumPageSize,
        ),
    }, signal)
    if (!result.data) throw new Error('Credit note search returned no data')
    return result.data.searchCreditNotes
}
