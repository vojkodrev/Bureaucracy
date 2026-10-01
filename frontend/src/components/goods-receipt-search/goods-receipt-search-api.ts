import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import type { GoodsReceiptPage } from '@/lib/goods-receipt-types'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'
import type { GoodsReceiptSearchCriteria } from './types'

type Response = {
    data?: { searchGoodsReceipts: GoodsReceiptPage }
    errors?: { message: string }[]
}

const query = `
    query SearchGoodsReceipts(
        $businessYear: String!
        $productCode: String
        $productName: String
        $receivedFrom: Time
        $receivedTo: Time
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchGoodsReceipts(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            receivedFrom: $receivedFrom
            receivedTo: $receivedTo
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            goodsReceipts {
                id
                receiptNumber
                receiptDate
                storage
                receivedBy
                items { id productCode productName unit quantity }
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

export async function fetchGoodsReceiptSearch(search: GoodsReceiptSearchCriteria, signal?: AbortSignal) {
    const result = await postGraphql<Response>(query, {
        businessYear: getSelectedBusinessYear(),
        productCode: optionalFilter(search.productCode),
        productName: optionalFilter(search.productName),
        receivedFrom: optionalDate(search.from),
        receivedTo: optionalDate(search.to),
        sortBy: search.sortBy || null,
        sortDirection: search.sortDirection || null,
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(positiveInteger(search.pageSize, defaultPageSize), maximumPageSize),
    }, signal)
    return result.data?.searchGoodsReceipts ?? null
}
