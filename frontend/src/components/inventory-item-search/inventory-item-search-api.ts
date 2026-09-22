import { getSelectedBusinessYear } from '@/lib/business-year'
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
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchInventoryItems(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
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

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function fetchInventoryItemSearch(
    search: InventoryItemSearchCriteria,
    signal?: AbortSignal,
): Promise<InventoryItemPage | null> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: {
                businessYear: getSelectedBusinessYear(),
                productCode: optionalFilter(search.productCode),
                productName: optionalFilter(search.productName),
                sortBy: search.sortBy || null,
                sortDirection: search.sortDirection || null,
                page: positiveInteger(search.page, defaultPage),
                pageSize: Math.min(
                    positiveInteger(search.pageSize, defaultPageSize),
                    maximumPageSize,
                ),
            },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Inventory item search failed (${response.status})`)
    const result = (await response.json()) as SearchInventoryItemsResponse
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(', '))
    }
    return result.data?.searchInventoryItems ?? null
}
