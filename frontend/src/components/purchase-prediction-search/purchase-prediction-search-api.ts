import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalFilter } from '@/lib/filters'
import { postGraphql } from '@/lib/graphql'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { PurchasePredictionPage } from '@/lib/purchase-prediction-types'
import type { PurchasePredictionSearchCriteria } from './types'

const query = `
    query SearchPurchasePredictions(
        $businessYear: String!
        $customerCode: String
        $customerName: String
        $productCode: String
        $productName: String
        $page: Int
        $pageSize: Int
    ) {
        searchPurchasePredictions(
            businessYear: $businessYear
            customerCode: $customerCode
            customerName: $customerName
            productCode: $productCode
            productName: $productName
            page: $page
            pageSize: $pageSize
        ) {
            predictions {
                id customerCode customerName productCode productName
                daysSinceLastOrder averageOrderFrequencyDays
                score7Days score14Days score30Days
            }
            totalCount page pageSize totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function fetchPurchasePredictions(
    search: PurchasePredictionSearchCriteria,
    signal?: AbortSignal,
) {
    type Response = {
        data?: { searchPurchasePredictions: PurchasePredictionPage }
    }
    const variables = {
        businessYear: getSelectedBusinessYear(),
        customerCode: optionalFilter(search.customerCode),
        customerName: optionalFilter(search.customerName),
        productCode: optionalFilter(search.productCode),
        productName: optionalFilter(search.productName),
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(positiveInteger(search.pageSize, defaultPageSize), maximumPageSize),
    }
    const result = await postGraphql<Response>(query, variables, signal)
    return result.data?.searchPurchasePredictions ?? null
}

export function purchasePredictionReportPdfUrl(
    search: PurchasePredictionSearchCriteria,
): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/purchase-predictions/report/pdf'
    for (const key of [
        'customerCode',
        'customerName',
        'productCode',
        'productName',
        'page',
        'pageSize',
    ] as const) {
        if (search[key]) url.searchParams.set(key, search[key])
    }
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    return url.toString()
}
