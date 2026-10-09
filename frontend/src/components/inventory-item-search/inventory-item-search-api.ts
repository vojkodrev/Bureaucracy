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

type InventoryItemGoodsReceiptCountsResponse = {
    data?: {
        inventoryItemGoodsReceiptCounts: {
            productCode: string
            goodsReceiptCount: number
        }[]
    }
    errors?: { message: string }[]
}

const itemListQuery = `
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
            items { id productCode name unit minimumStockLevel currentStock }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const lowStockQuery = `
    query SearchLowStockInventoryItems(
        $businessYear: String!
        $productCode: String
        $productName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchInventoryItems: searchLowStockInventoryItems(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            items { id productCode name unit minimumStockLevel currentStock }
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
    if (search.resultsView === 'lowStock') {
        return fetchLowStockInventoryItemSearch(search, signal)
    }
    const result = await postGraphql<SearchInventoryItemsResponse>(
        itemListQuery,
        {
            ...searchVariables(search),
            similarName: optionalFilter(similarName ?? ''),
        },
        signal,
    )
    return result.data?.searchInventoryItems ?? null
}

async function fetchLowStockInventoryItemSearch(
    search: InventoryItemSearchCriteria,
    signal?: AbortSignal,
): Promise<InventoryItemPage | null> {
    const result = await postGraphql<SearchInventoryItemsResponse>(
        lowStockQuery,
        searchVariables(search),
        signal,
    )
    return result.data?.searchInventoryItems ?? null
}

function searchVariables(search: InventoryItemSearchCriteria) {
    return {
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
    }
}

const inventoryItemGoodsReceiptCountsQuery = `
    query InventoryItemGoodsReceiptCounts($businessYear: String!, $productCodes: [String!]!) {
        inventoryItemGoodsReceiptCounts(businessYear: $businessYear, productCodes: $productCodes) {
            productCode
            goodsReceiptCount
        }
    }
`

export async function fetchInventoryItemGoodsReceiptCounts(
    productCodes: string[],
    signal?: AbortSignal,
): Promise<Record<string, number>> {
    const result = await postGraphql<InventoryItemGoodsReceiptCountsResponse>(
        inventoryItemGoodsReceiptCountsQuery,
        { businessYear: getSelectedBusinessYear(), productCodes },
        signal,
    )
    return Object.fromEntries(
        (result.data?.inventoryItemGoodsReceiptCounts ?? []).map(
            ({ productCode, goodsReceiptCount }) => [productCode, goodsReceiptCount],
        ),
    )
}
