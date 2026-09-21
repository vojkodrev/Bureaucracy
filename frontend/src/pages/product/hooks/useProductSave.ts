import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { emptyToNull } from '@/lib/form-input'
import { isOptionalNonNegativeNumber, numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import { postSaveProduct } from '../product-api'
import { productDraft } from './useProductDraft'
import type { ProductDraft } from './useProductDraft'

type Options = {
    productId: number | null
    draft: ProductDraft
    grossPrice: string
    routeProductCode?: string
    isLoading: boolean
    loadError: string | null
    isDuplicating: boolean
    navigate: NavigateFunction
    replaceDraft: (draft: ProductDraft) => void
    markClean: (draft: ProductDraft) => void
    setProductId: (id: number | null) => void
    clearDuplicateError: () => void
    allowNavigation: () => void
    reloadAfterSave: () => void
}

export function useProductSave({
    productId, draft, grossPrice, routeProductCode, isLoading, loadError, isDuplicating,
    navigate, replaceDraft, markClean, setProductId, clearDuplicateError,
    allowNavigation, reloadAfterSave,
}: Options) {
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const canSave = Boolean(draft.productCode.trim() && draft.name.trim()) &&
        isOptionalNonNegativeNumber(draft.netPrice) &&
        isOptionalNonNegativeNumber(draft.taxRate) &&
        !isLoading && !isDuplicating && !loadError

    const saveProduct = async () => {
        if (!canSave || isSaving) return false
        const isCreating = productId == null
        setIsSaving(true)
        setSaveError(null)
        clearDuplicateError()
        try {
            const savedProduct = await postSaveProduct({
                id: productId,
                productCode: draft.productCode.trim(),
                name: emptyToNull(draft.name),
                unit: emptyToNull(draft.unit),
                netPrice: numberOrNull(draft.netPrice),
                grossPrice: numberOrNull(grossPrice),
                taxRate: numberOrNull(draft.taxRate),
                taxCode: emptyToNull(draft.taxCode),
            })
            const savedDraft = productDraft(savedProduct)
            setProductId(savedProduct.id)
            replaceDraft(savedDraft)
            markClean(savedDraft)
            toast.add({
                title: 'Product saved',
                description: `${savedProduct.productCode} was ${isCreating ? 'created' : 'updated'} successfully.`,
                type: 'success',
            })
            if (routeProductCode === savedProduct.productCode) reloadAfterSave()
            else {
                allowNavigation()
                navigate(`/product/${encodeURIComponent(savedProduct.productCode ?? '')}`)
            }
            return true
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Saving product failed')
            return false
        } finally {
            setIsSaving(false)
        }
    }

    return { canSave, saveProduct, isSaving, saveError, setSaveError }
}
