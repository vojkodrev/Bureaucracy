import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import type { Product } from '@/lib/product-types'
import { nextPaddedNumber } from '@/lib/numbers'

const productQuery = `
    query Product($businessYear: String!, $productCode: String!) {
        product(businessYear: $businessYear, productCode: $productCode) {
            id productCode name barcode unit netPrice grossPrice taxRate taxCode
        }
    }
`

const latestProductQuery = `
    query LatestProduct($businessYear: String!) {
        searchProducts(businessYear: $businessYear, sortBy: "productCode", sortDirection: "desc", page: 1, pageSize: 1) {
            products { productCode }
        }
    }
`

const saveProductMutation = `
    mutation SaveProduct($businessYear: String!, $product: ProductInput!) {
        saveProduct(businessYear: $businessYear, product: $product) {
            id productCode name barcode unit netPrice grossPrice taxRate taxCode
        }
    }
`

const productInvoiceCountQuery = `
    query ProductInvoiceCount($businessYear: String!, $productCodes: [String!]!) {
        productInvoiceCounts(businessYear: $businessYear, productCodes: $productCodes) {
            productCode invoiceCount
        }
    }
`

export async function fetchProduct(productCode: string, signal?: AbortSignal): Promise<Product> {
    const result = await postGraphql<{ data?: { product: Product | null }; errors?: { message: string }[] }>(
        productQuery,
        { businessYear: getSelectedBusinessYear(), productCode },
        signal,
    )
    if (!result.data?.product) throw new Error(`Product ${productCode} was not found`)
    return result.data.product
}

export async function fetchProductExists(productCode: string): Promise<boolean> {
    const result = await postGraphql<{ data?: { product: Pick<Product, 'id'> | null } }>(
        productQuery, { businessYear: getSelectedBusinessYear(), productCode },
    )
    return result.data?.product != null
}

export async function fetchNextProductCode(signal?: AbortSignal): Promise<string> {
    const result = await postGraphql<{
        data?: { searchProducts: { products: Pick<Product, 'productCode'>[] } }
        errors?: { message: string }[]
    }>(latestProductQuery, { businessYear: getSelectedBusinessYear() }, signal)
    return nextPaddedNumber(result.data?.searchProducts.products[0]?.productCode, 4)
}

export async function postSaveProduct(product: Record<string, unknown>): Promise<Product> {
    const result = await postGraphql<{
        data?: { saveProduct: Product }
        errors?: { message: string }[]
    }>(saveProductMutation, { businessYear: getSelectedBusinessYear(), product })
    if (!result.data?.saveProduct) throw new Error('Saving product returned no product')
    return result.data.saveProduct
}

export async function fetchProductInvoiceCount(productCode: string): Promise<number> {
    const result = await postGraphql<{
        data?: { productInvoiceCounts: { productCode: string, invoiceCount: number }[] }
        errors?: { message: string }[]
    }>(productInvoiceCountQuery, {
        businessYear: getSelectedBusinessYear(),
        productCodes: [productCode],
    })
    return result.data?.productInvoiceCounts[0]?.invoiceCount ?? 0
}
