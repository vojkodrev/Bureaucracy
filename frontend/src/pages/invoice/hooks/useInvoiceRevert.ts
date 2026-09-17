import { useState } from 'react'

type Options = {
    routeInvoiceNumber?: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    isSaving: boolean
    isDuplicating: boolean
    clearSaveError: () => void
    clearPrintError: () => void
    reload: () => void
}

export function useInvoiceRevert({
    routeInvoiceNumber, hasUnsavedChanges, isLoading, isSaving, isDuplicating,
    clearSaveError, clearPrintError, reload,
}: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const canRevert = Boolean(routeInvoiceNumber) && !isLoading && !isSaving && !isDuplicating

    const performRevert = () => {
        setConfirmingRevert(false)
        clearSaveError()
        clearPrintError()
        reload()
    }

    const requestRevert = () => {
        if (!canRevert) return
        if (hasUnsavedChanges) setConfirmingRevert(true)
        else performRevert()
    }

    return { canRevert, confirmingRevert, setConfirmingRevert, requestRevert, performRevert }
}
