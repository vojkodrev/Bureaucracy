import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import { optionalFilter } from '@/lib/filters'
import type { InventoryItemPage } from '@/lib/inventory-item-types'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type { InventoryItemSearchCriteria } from './types'

type SearchInventoryItemsResponse = {
    data?: { searchInventoryItems: InventoryItemPage }
    errors?: { message: string }[]
}

const query = `
    query SearchInventoryItems(
        $businessYear: String!
        $productCode: String
        $productName: String
        $similarName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchInventoryItems(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            similarName: $similarName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            items { id productCode name unit minimumStockLevel }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

export async function fetchInventoryItemSearch(
    search: InventoryItemSearchCriteria,
    similarName: string | undefined,
    signal?: AbortSignal,
): Promise<InventoryItemPage | null> {
    const result = await postGraphql<SearchInventoryItemsResponse>(query, {
        businessYear: getSelectedBusinessYear(),
        productCode: optionalFilter(search.productCode),
        productName: optionalFilter(search.productName),
        similarName: optionalFilter(similarName ?? ''),
        sortBy: search.sortBy || null,
        sortDirection: search.sortDirection || null,
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(
            positiveInteger(search.pageSize, defaultPageSize),
            maximumPageSize,
        ),
    }, signal)
    return result.data?.searchInventoryItems ?? null
}
