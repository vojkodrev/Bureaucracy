import { useMemo, useState } from 'react'
import type { Product } from '@/lib/product-types'
import { numberOrNull } from '@/lib/numbers'

export type ProductDraft = {
    productCode: string
    name: string
    unit: string
    netPrice: string
    taxRate: string
    taxCode: string
}

export function productDraft(product?: Product | null): ProductDraft {
    return {
        productCode: product?.productCode ?? '',
        name: product?.name ?? '',
        unit: product?.unit ?? '',
        netPrice: product?.netPrice == null ? '' : String(product.netPrice),
        taxRate: product?.taxRate == null ? '' : String(product.taxRate),
        taxCode: product?.taxCode ?? '',
    }
}

export function useProductDraft() {
    const [draft, setDraft] = useState<ProductDraft>(productDraft)
    const [cleanDraft, setCleanDraft] = useState(() => JSON.stringify(productDraft()))
    const serializedDraft = useMemo(() => JSON.stringify(draft), [draft])

    const setField = <K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }
    const markClean = (value: ProductDraft = draft) => setCleanDraft(JSON.stringify(value))

    const netPrice = numberOrNull(draft.netPrice)
    const taxRate = numberOrNull(draft.taxRate)
    const grossPrice = netPrice == null || taxRate == null
        ? ''
        : (netPrice * (1 + taxRate / 100)).toFixed(2)

    return {
        draft,
        setDraft,
        setField,
        markClean,
        markUnsaved: () => setCleanDraft('__unsaved__'),
        hasUnsavedChanges: serializedDraft !== cleanDraft,
        grossPrice,
    }
}
