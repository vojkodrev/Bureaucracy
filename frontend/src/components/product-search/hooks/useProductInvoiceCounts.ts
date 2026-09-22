import { useEffect, useMemo, useState } from 'react'
import type { ProductPage } from '@/lib/product-types'
import { fetchProductInvoiceCounts } from '../product-search-api'

type InvoiceCountResult = {
    key: string
    counts: Record<string, number>
    error: boolean
}

export function useProductInvoiceCounts(
    enabled: boolean,
    productPage: ProductPage | null,
    searchKey: string,
) {
    const productCodes = useMemo(
        () => productPage?.products.flatMap(({ productCode }) => productCode ? [productCode] : [])
            ?? [],
        [productPage],
    )
    const requestKey = enabled && productPage
        ? `${searchKey}:${productCodes.join(',')}`
        : '__disabled__'
    const [result, setResult] = useState<InvoiceCountResult>({
        key: '__initial__',
        counts: {},
        error: false,
    })
    const hasProductCodes = productCodes.length > 0
    const isLoading = enabled && productPage != null && hasProductCodes && result.key !== requestKey

    useEffect(() => {
        if (!enabled || !productPage) return
        if (productCodes.length === 0) return

        const controller = new AbortController()
        void fetchProductInvoiceCounts(productCodes, controller.signal)
            .then((counts) => setResult({ key: requestKey, counts, error: false }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({ key: requestKey, counts: {}, error: true })
            })
        return () => controller.abort()
    }, [enabled, productCodes, productPage, requestKey])

    return {
        counts: hasProductCodes ? result.counts : {},
        isLoading,
        error: hasProductCodes && result.error,
    }
}
