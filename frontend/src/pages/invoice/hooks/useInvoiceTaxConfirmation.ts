import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { toast } from '@/lib/toast'
import { confirmInvoiceTax } from '../invoice-api'
import type { InvoiceTaxConfirmation } from '../invoice-api'

type Options = {
    invoiceNumber: string
    canConfirm: boolean
    canSave: boolean
    onConfirmed: (confirmation: InvoiceTaxConfirmation) => void
}

export function useInvoiceTaxConfirmation({ invoiceNumber, canConfirm, canSave, onConfirmed }: Options) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmingUnsavedTaxConfirmation, setConfirmingUnsavedTaxConfirmation] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const confirm = async () => {
        if (!canConfirm || isConfirming) return
        setIsConfirming(true)
        setError(null)
        try {
            const request = confirmInvoiceTax(invoiceNumber.trim(), getSelectedBusinessYear())
            toast.add({
                title: 'Tax confirmation requested',
                description: 'Waiting for a response from FURS.',
                type: 'info',
            })
            const result = await request
            onConfirmed(result)
            setDialogOpen(false)
            toast.add({ title: 'Tax confirmation completed', description: `EOR: ${result.eor}`, type: 'success' })
        } catch (value) {
            setError(value instanceof Error ? value.message : 'Tax confirmation failed')
        } finally {
            setIsConfirming(false)
        }
    }

    const request = () => {
        if (canConfirm) setDialogOpen(true)
        else if (canSave) setConfirmingUnsavedTaxConfirmation(true)
    }

    return {
        dialogOpen,
        setDialogOpen,
        confirmingUnsavedTaxConfirmation,
        setConfirmingUnsavedTaxConfirmation,
        isConfirming,
        error,
        request,
        confirm,
    }
}
