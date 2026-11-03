import { useState } from 'react'

type Options = {
    routeNumber?: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    isSaving: boolean
    isDuplicating: boolean
    clearErrors: () => void
    reload: () => void
}

export function useDeliveryNoteRevert(options: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const canRevert = Boolean(options.routeNumber)
        && !options.isLoading
        && !options.isSaving
        && !options.isDuplicating
    const performRevert = () => {
        setConfirmingRevert(false)
        options.clearErrors()
        options.reload()
    }
    const requestRevert = () => {
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
