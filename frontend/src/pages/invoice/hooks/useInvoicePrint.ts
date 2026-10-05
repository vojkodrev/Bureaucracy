import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { invoicePdfUrl } from '../invoice-api'
import { openAuthenticatedUrl } from '@/lib/auth'

type Options = {
    invoiceId: number | null
    invoiceNumber: string
    hasUnsavedChanges: boolean
    isLoading: boolean
    loadError: string | null
    isSaving: boolean
    isDuplicating: boolean
    canSave: boolean
}

export function useInvoicePrint({
    invoiceId, invoiceNumber, hasUnsavedChanges, isLoading, loadError,
    isSaving, isDuplicating, canSave,
}: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const [confirmingPrint, setConfirmingPrint] = useState(false)
    const canPrint = invoiceId != null && Boolean(invoiceNumber.trim()) &&
        !hasUnsavedChanges && !isLoading && !loadError && !isSaving && !isDuplicating
    const canRequestPrint = Boolean(invoiceNumber.trim()) && !isLoading &&
        !loadError && !isSaving && !isDuplicating

    const printInvoice = async () => {
        if (!canPrint) {
            if (canSave) setConfirmingPrint(true)
            return
        }
        try {
            await openAuthenticatedUrl(invoicePdfUrl(invoiceNumber.trim(), getSelectedBusinessYear()))
            setPrintError(null)
        } catch (error) {
            setPrintError(error instanceof Error ? error.message : 'Could not open the invoice PDF.')
        }
    }

    return {
        canPrint, canRequestPrint, printInvoice, printError, setPrintError,
        confirmingPrint, setConfirmingPrint,
    }
}
