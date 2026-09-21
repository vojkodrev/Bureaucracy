import { useState } from 'react'
import { toast } from '@/lib/toast'
import { productDraft } from './useProductDraft'
import type { ProductDraft } from './useProductDraft'

type Options = {
    routeProductCode?: string
    hasUnsavedChanges: boolean
    isDuplicating: boolean
    clearSaveError: () => void
    clearDuplicateError: () => void
    replaceDraft: (draft: ProductDraft) => void
    markClean: (draft: ProductDraft) => void
    reload: () => void
}

export function useProductRevert({
    routeProductCode, hasUnsavedChanges, isDuplicating, clearSaveError, clearDuplicateError,
    replaceDraft, markClean, reload,
}: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const canRevert = hasUnsavedChanges && !isDuplicating

    const performRevert = () => {
        setConfirmingRevert(false)
        clearSaveError()
        clearDuplicateError()
        if (routeProductCode) reload()
        else {
            const emptyDraft = productDraft()
            replaceDraft(emptyDraft)
            markClean(emptyDraft)
        }
        toast.add({
            title: 'Product reverted',
            description: routeProductCode
                ? `${routeProductCode} was restored to its last saved version.`
                : 'The new product form was cleared.',
            type: 'success',
        })
    }

    return {
        canRevert,
        confirmingRevert,
        setConfirmingRevert,
        requestRevert: () => { if (canRevert) setConfirmingRevert(true) },
        performRevert,
    }
}
