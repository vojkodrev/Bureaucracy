import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { emptyToNull } from '@/lib/form-input'
import { isOptionalNonNegativeNumber, numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import { fetchProductInvoiceCount, postSaveProduct } from '../product-api'
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
    const [invoiceCountWarning, setInvoiceCountWarning] = useState<number | null>(null)
    const canSave = Boolean(draft.productCode.trim() && draft.name.trim()) &&
        isOptionalNonNegativeNumber(draft.netPrice) &&
        isOptionalNonNegativeNumber(draft.taxRate) &&
        !isLoading && !isDuplicating && !loadError

    const performSave = async () => {
        const isCreating = productId == null
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
        }
    }

    const requestSave = async () => {
        if (!canSave || isSaving) return false
        setIsSaving(true)
        setSaveError(null)
        clearDuplicateError()
        try {
            if (productId != null && routeProductCode) {
                const invoiceCount = await fetchProductInvoiceCount(routeProductCode)
                if (invoiceCount > 0) {
                    setInvoiceCountWarning(invoiceCount)
                    return false
                }
            }
            return await performSave()
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error
                ? requestError.message
                : 'Checking product invoice usage failed')
            return false
        } finally {
            setIsSaving(false)
        }
    }

    const confirmSave = async () => {
        if (!canSave || isSaving) return false
        setInvoiceCountWarning(null)
        setIsSaving(true)
        setSaveError(null)
        clearDuplicateError()
        try { return await performSave() }
        finally { setIsSaving(false) }
    }

    return {
        canSave, requestSave, confirmSave, isSaving, saveError, setSaveError,
        invoiceCountWarning, setInvoiceCountWarning,
    }
}
