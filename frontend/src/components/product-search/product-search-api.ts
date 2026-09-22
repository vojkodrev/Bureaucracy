import { getSelectedBusinessYear } from '@/lib/business-year'
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

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function fetchProductSearch(
    search: ProductSearchForm,
    similarName: string | undefined,
    signal?: AbortSignal,
): Promise<ProductPage | null> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: searchProductsQuery,
            variables: {
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
            },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Product search failed (${response.status})`)

    const result = (await response.json()) as SearchProductsResponse
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(', '))
    }
    return result.data?.searchProducts ?? null
}

export async function fetchProductInvoiceCounts(
    productCodes: string[],
    signal?: AbortSignal,
): Promise<Record<string, number>> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: productInvoiceCountsQuery,
            variables: { businessYear: getSelectedBusinessYear(), productCodes },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Product invoice counts failed (${response.status})`)

    const result = (await response.json()) as ProductInvoiceCountsResponse
    if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(', '))
    }
    return Object.fromEntries(
        (result.data?.productInvoiceCounts ?? []).map(
            ({ productCode, invoiceCount }) => [productCode, invoiceCount],
        ),
    )
}
