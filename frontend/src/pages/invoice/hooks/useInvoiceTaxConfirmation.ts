import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { toast } from '@/lib/toast'
import { confirmInvoiceTax } from '../invoice-api'

type Options = { invoiceNumber: string; canConfirm: boolean }

export function useInvoiceTaxConfirmation({ invoiceNumber, canConfirm }: Options) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const confirm = async () => {
        if (!canConfirm || isConfirming) return
        setIsConfirming(true)
        setError(null)
        try {
            const result = await confirmInvoiceTax(invoiceNumber.trim(), getSelectedBusinessYear())
            setDialogOpen(false)
            toast.add({ title: 'Tax confirmation completed', description: `EOR: ${result.eor}`, type: 'success' })
        } catch (value) {
            setError(value instanceof Error ? value.message : 'Tax confirmation failed')
        } finally {
            setIsConfirming(false)
        }
    }

    return { dialogOpen, setDialogOpen, isConfirming, error, request: () => setDialogOpen(true), confirm }
}
