import { useEffect, useState } from 'react'
import type { Product, ProductPage } from '@/lib/product-types'
import { fetchProductSearch } from '../product-search-api'
import type { ProductSearchForm } from '../types'

const emptyProducts: Product[] = []

type ProductSearchResult = {
    searchKey: string
    productPage: ProductPage | null
    error: string | null
}

export function useProductSearchResults(
    search: ProductSearchForm,
    searchKey: string,
    similarName?: string,
) {
    const [result, setResult] = useState<ProductSearchResult>({
        searchKey: '__initial__',
        productPage: null,
        error: null,
    })
    const isLoading = result.searchKey !== searchKey
    const productPage = isLoading ? null : result.productPage
    const products = productPage?.products ?? emptyProducts
    const error = isLoading ? null : result.error

    useEffect(() => {
        const controller = new AbortController()
        void fetchProductSearch(search, similarName, controller.signal)
            .then((nextPage) => setResult({ searchKey, productPage: nextPage, error: null }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    searchKey,
                    productPage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Product search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey, similarName])

    return { productPage, products, isLoading, error }
}
