import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { fetchNextProductCode, fetchProduct } from '../product-api'
import { productDraft } from './useProductDraft'
import type { ProductDraft } from './useProductDraft'

type Options = {
    routeProductCode?: string
    replaceDraft: (draft: ProductDraft) => void
    markClean: (draft: ProductDraft) => void
    disallowNavigation: () => void
}

const wasAborted = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

export function useProductLoader({
    routeProductCode, replaceDraft, markClean, disallowNavigation,
}: Options) {
    const preserveDuplicateRef = useRef(false)
    const [productId, setProductId] = useState<number | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const replaceLoadedDraft = useEffectEvent(replaceDraft)
    const markLoadedDraftClean = useEffectEvent(markClean)
    const finishNavigation = useEffectEvent(disallowNavigation)
    const requestKey = `${routeProductCode ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState({
        requestKey: '__initial__', error: null as string | null,
    })
    const isLoading = Boolean(routeProductCode) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null

    useEffect(() => {
        if (!routeProductCode) return
        const controller = new AbortController()
        void fetchProduct(routeProductCode, controller.signal).then((product) => {
            const loadedDraft = productDraft(product)
            setProductId(product.id)
            replaceLoadedDraft(loadedDraft)
            markLoadedDraftClean(loadedDraft)
            finishNavigation()
            setLoadResult({ requestKey, error: null })
        }).catch((requestError: unknown) => {
            if (wasAborted(requestError)) return
            setLoadResult({
                requestKey,
                error: requestError instanceof Error ? requestError.message : 'Loading product failed',
            })
        })
        return () => controller.abort()
    }, [requestKey, routeProductCode])

    useEffect(() => {
        if (routeProductCode) return
        if (preserveDuplicateRef.current) {
            preserveDuplicateRef.current = false
            finishNavigation()
            setLoadResult({ requestKey, error: null })
            return
        }
        const emptyDraft = productDraft()
        setProductId(null)
        replaceLoadedDraft(emptyDraft)
        markLoadedDraftClean(emptyDraft)
        finishNavigation()
        setLoadResult({ requestKey, error: null })

        const controller = new AbortController()
        void fetchNextProductCode(controller.signal).then((productCode) => {
            const initialDraft = { ...emptyDraft, productCode }
            replaceLoadedDraft(initialDraft)
            markLoadedDraftClean(initialDraft)
        }).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) console.error(requestError)
        })
        return () => controller.abort()
    }, [requestKey, routeProductCode])

    return {
        productId,
        setProductId,
        isLoading,
        error,
        reload: () => setReloadVersion((version) => version + 1),
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => { preserveDuplicateRef.current = true },
    }
}
