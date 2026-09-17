import { getSelectedBusinessYear } from '@/lib/business-year'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { PriceQuotePage, PriceQuoteSearchCriteria } from './types'
import type { PriceQuote } from './types'
import { nextPaddedNumber } from '@/lib/numbers'

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

export async function fetchPriceQuotes(
    search: PriceQuoteSearchCriteria,
    signal?: AbortSignal,
): Promise<PriceQuotePage> {
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
    const result = await response.json() as {
        data?: { searchPriceQuotes: PriceQuotePage }
        errors?: { message: string }[]
    }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    if (!result.data) throw new Error('Price quote search returned no data')
    return result.data.searchPriceQuotes
}

const priceQuoteQuery = `
    query PriceQuote($businessYear: String!, $quoteNumber: String!) {
        priceQuote(businessYear: $businessYear, quoteNumber: $quoteNumber) {
            id quoteNumber issueDate dueDate customerCode customerName customerAddress
            customerPostalCode customerCity customerCountry amount introductoryText closingText
            items { id sequence productCode productName unit taxCode taxRate unitPrice
                unitTaxAmount quantity discount netAmount grossAmount }
        }
    }
`

const templateQuery = `query PriceQuoteTextTemplate($businessYear: String!) {
    priceQuoteTextTemplate(businessYear: $businessYear) { introductoryText closingText }
}`

const saveMutation = `mutation SavePriceQuote($businessYear: String!, $priceQuote: PriceQuoteInput!) {
    savePriceQuote(businessYear: $businessYear, priceQuote: $priceQuote) { id quoteNumber }
}`

async function postGraphql<T>(
    query: string,
    variables: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(graphqlUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
        body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const result = await response.json() as T & { errors?: { message: string }[] }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result
}

export async function fetchPriceQuote(
    quoteNumber: string,
    signal?: AbortSignal,
): Promise<PriceQuote> {
    const result = await postGraphql<{
        data?: { priceQuote: PriceQuote | null }
    }>(
        priceQuoteQuery,
        { businessYear: getSelectedBusinessYear(), quoteNumber },
        signal,
    )
    if (!result.data?.priceQuote) throw new Error(`Price quote ${quoteNumber} was not found`)
    return result.data.priceQuote
}

export async function fetchNextPriceQuoteNumber(signal?: AbortSignal): Promise<string> {
    const result = await fetchPriceQuotes({
        quoteNumber: '', customerId: '', customerName: '', productCode: '', productName: '',
        from: '', to: '', page: '1', pageSize: '1', sortBy: 'quoteNumber', sortDirection: 'desc',
    }, signal)
    return nextPaddedNumber(result.priceQuotes[0]?.quoteNumber, 5)
}

export async function fetchPriceQuoteTextTemplate(signal?: AbortSignal) {
    const result = await postGraphql<{
        data?: {
            priceQuoteTextTemplate: {
                introductoryText: string | null
                closingText: string | null
            }
        }
    }>(
        templateQuery,
        { businessYear: getSelectedBusinessYear() },
        signal,
    )
    return result.data?.priceQuoteTextTemplate ?? { introductoryText: null, closingText: null }
}

export async function savePriceQuote(priceQuote: Record<string, unknown>) {
    return postGraphql<{ data?: { savePriceQuote: { id: number; quoteNumber: string } } }>(saveMutation, {
        businessYear: getSelectedBusinessYear(), priceQuote,
    })
}

export function priceQuotePdfUrl(quoteNumber: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/price-quotes/${encodeURIComponent(quoteNumber)}/pdf`
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    return url.toString()
}
