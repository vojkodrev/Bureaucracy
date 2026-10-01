import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import { optionalFilter } from '@/lib/filters'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type { ProductPage } from '@/lib/product-types'
import type { ProductSearchForm } from './types'

type SearchProductsResponse = {
    data?: { searchProducts: ProductPage }
    errors?: { message: string }[]
}

type ProductInvoiceCountsResponse = {
    data?: {
        productInvoiceCounts: { productCode: string, invoiceCount: number }[]
    }
    errors?: { message: string }[]
}

const searchProductsQuery = `
    query SearchProducts(
        $businessYear: String!
        $productCode: String
        $productName: String
        $similarName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchProducts(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            similarName: $similarName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            products {
                id
                productCode
                name
                unit
                netPrice
                grossPrice
                taxRate
                taxCode
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const productInvoiceCountsQuery = `
    query ProductInvoiceCounts($businessYear: String!, $productCodes: [String!]!) {
        productInvoiceCounts(businessYear: $businessYear, productCodes: $productCodes) {
            productCode
            invoiceCount
        }
    }
`

export async function fetchProductSearch(
    search: ProductSearchForm,
    similarName: string | undefined,
    signal?: AbortSignal,
): Promise<ProductPage | null> {
    const result = await postGraphql<SearchProductsResponse>(searchProductsQuery, {
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
    return result.data?.searchProducts ?? null
}

export async function fetchProductInvoiceCounts(
    productCodes: string[],
    signal?: AbortSignal,
): Promise<Record<string, number>> {
    const result = await postGraphql<ProductInvoiceCountsResponse>(productInvoiceCountsQuery, {
        businessYear: getSelectedBusinessYear(), productCodes,
    }, signal)
    return Object.fromEntries(
        (result.data?.productInvoiceCounts ?? []).map(
            ({ productCode, invoiceCount }) => [productCode, invoiceCount],
        ),
    )
}
