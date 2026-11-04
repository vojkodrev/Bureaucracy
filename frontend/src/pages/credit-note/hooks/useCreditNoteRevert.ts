import { useState } from 'react'

type Options = {
    routeNumber?: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    isSaving: boolean
    clearSaveError: () => void
    clearPrintError: () => void
    reload: () => void
}

export function useCreditNoteRevert(options: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const canRevert = Boolean(options.routeNumber) &&
        !options.isLoading && !options.isSaving
    function performRevert() {
        setConfirmingRevert(false)
        options.clearSaveError()
        options.clearPrintError()
        options.reload()
    }
    function requestRevert() {
        if (!canRevert) return
        if (options.hasUnsavedChanges) setConfirmingRevert(true)
        else performRevert()
    }
    return {
        canRevert,
        confirmingRevert,
        setConfirmingRevert,
        requestRevert,
        performRevert,
    }
}
