import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { invoicePdfUrl } from '../invoice-api'

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

    const printInvoice = () => {
        if (!canPrint) {
            if (canSave) setConfirmingPrint(true)
            return
        }
        const pdfTab = window.open(
            invoicePdfUrl(invoiceNumber.trim(), getSelectedBusinessYear()), '_blank',
        )
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the invoice PDF.')
            return
        }
        pdfTab.opener = null
        setPrintError(null)
    }

    return {
        canPrint, canRequestPrint, printInvoice, printError, setPrintError,
        confirmingPrint, setConfirmingPrint,
    }
}
