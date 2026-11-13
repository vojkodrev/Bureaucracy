import { getSelectedBusinessYear } from '@/lib/business-year'
import { optionalFilter } from '@/lib/filters'
import { postGraphql } from '@/lib/graphql'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { PurchasePredictionPage, PurchasePredictionSnapshot } from '@/lib/purchase-prediction-types'
import type { PurchasePredictionSearchCriteria } from './types'

const query = `
    query SearchPurchasePredictions(
        $businessYear: String!
        $snapshotId: ID
        $customerCode: String
        $customerName: String
        $productCode: String
        $productName: String
        $page: Int
        $pageSize: Int
    ) {
        searchPurchasePredictions(
            businessYear: $businessYear
            snapshotId: $snapshotId
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
            snapshotId snapshotName totalCount page pageSize totalPages
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
        snapshotId: optionalFilter(search.snapshotId),
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

const snapshotsQuery = `query PurchasePredictionSnapshots {
    purchasePredictionSnapshots { id name }
}`

export async function fetchPurchasePredictionSnapshots(signal?: AbortSignal) {
    type Response = { data?: { purchasePredictionSnapshots: PurchasePredictionSnapshot[] } }
    const result = await postGraphql<Response>(snapshotsQuery, {}, signal)
    return result.data?.purchasePredictionSnapshots ?? []
}

export function purchasePredictionReportPdfUrl(
    search: PurchasePredictionSearchCriteria,
): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/purchase-predictions/report/pdf'
    for (const key of [
        'snapshotId',
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
