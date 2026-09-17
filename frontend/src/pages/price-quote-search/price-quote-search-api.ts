import { getSelectedBusinessYear } from '@/lib/business-year'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { PriceQuotePage, PriceQuoteSearchCriteria } from './types'

const query = `
    query SearchPriceQuotes($businessYear: String!, $quoteNumber: String, $customerId: String,
        $customerName: String, $productCode: String, $productName: String,
        $issuedFrom: Time, $issuedTo: Time, $sortBy: String, $sortDirection: String,
        $page: Int, $pageSize: Int) {
        searchPriceQuotes(businessYear: $businessYear, quoteNumber: $quoteNumber,
            customerId: $customerId, customerName: $customerName, productCode: $productCode,
            productName: $productName, issuedFrom: $issuedFrom, issuedTo: $issuedTo,
            sortBy: $sortBy, sortDirection: $sortDirection, page: $page, pageSize: $pageSize) {
            priceQuotes { id quoteNumber issueDate dueDate customerCode customerName currency amount }
            totalCount page pageSize totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const optional = (value: string) => value || null

export async function fetchPriceQuotes(search: PriceQuoteSearchCriteria, signal?: AbortSignal): Promise<PriceQuotePage> {
    const response = await fetch(graphqlUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
        body: JSON.stringify({ query, variables: {
            businessYear: getSelectedBusinessYear(),
            quoteNumber: optional(search.quoteNumber), customerId: optional(search.customerId),
            customerName: optional(search.customerName), productCode: optional(search.productCode),
            productName: optional(search.productName), issuedFrom: optional(search.from), issuedTo: optional(search.to),
            sortBy: optional(search.sortBy), sortDirection: optional(search.sortDirection),
            page: positiveInteger(search.page, defaultPage),
            pageSize: Math.min(positiveInteger(search.pageSize, defaultPageSize), maximumPageSize),
        }}),
    })
    if (!response.ok) throw new Error(`Price quote search failed (${response.status})`)
    const result = await response.json() as { data?: { searchPriceQuotes: PriceQuotePage }, errors?: { message: string }[] }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    if (!result.data) throw new Error('Price quote search returned no data')
    return result.data.searchPriceQuotes
}
