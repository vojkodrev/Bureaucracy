import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { toast } from '@/lib/toast'
import { fetchNextProductCode } from '../product-api'
import type { ProductDraft } from './useProductDraft'

type Options = {
    productId: number | null
    hasUnsavedChanges: boolean
    navigate: NavigateFunction
    setProductId: (id: number | null) => void
    replaceDraft: React.Dispatch<React.SetStateAction<ProductDraft>>
    markUnsaved: () => void
    preserveDuplicateDraft: () => void
    allowNavigation: () => void
}

export function useProductDuplicate({
    productId, hasUnsavedChanges, navigate, setProductId, replaceDraft, markUnsaved,
    preserveDuplicateDraft, allowNavigation,
}: Options) {
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)
    const [duplicateError, setDuplicateError] = useState<string | null>(null)

    const performDuplicate = async () => {
        if (productId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        setDuplicateError(null)
        try {
            const nextProductCode = await fetchNextProductCode()
            setProductId(null)
            replaceDraft((current) => ({ ...current, productCode: nextProductCode }))
            markUnsaved()
            preserveDuplicateDraft()
            allowNavigation()
            navigate('/product')
            toast.add({
                title: 'Product duplicated',
                description: `Product code ${nextProductCode} has been assigned to the new unsaved copy. ` +
                    'You can review and edit it before saving.',
                type: 'info',
            })
        } catch (requestError: unknown) {
            setDuplicateError(requestError instanceof Error
                ? requestError.message
                : 'Duplicating product failed')
        } finally {
            setIsDuplicating(false)
        }
    }

    const duplicate = async () => {
        if (productId == null || isDuplicating) return
        if (hasUnsavedChanges) {
            setConfirmingDuplicate(true)
            return
        }
        await performDuplicate()
    }

    return {
        duplicate,
        performDuplicate,
        isDuplicating,
        confirmingDuplicate,
        setConfirmingDuplicate,
        duplicateError,
        setDuplicateError,
    }
}
