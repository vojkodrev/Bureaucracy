import { useState } from 'react'

type Options = {
    canEmail: boolean
    canSave: boolean
    total: number
    paidAmount: string
}

export function useInvoiceEmail({ canEmail, canSave, total, paidAmount }: Options) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmingUnsavedEmail, setConfirmingUnsavedEmail] = useState(false)
    const [confirmingPaidInvoiceEmail, setConfirmingPaidInvoiceEmail] = useState(false)
    const isPaidInFull = total > 0
        && Math.round((Number(paidAmount) || 0) * 100) >= Math.round(total * 100)

    const requestEmail = () => {
        if (canEmail) {
            if (isPaidInFull) setConfirmingPaidInvoiceEmail(true)
            else setDialogOpen(true)
        } else if (canSave) {
            setConfirmingUnsavedEmail(true)
        }
    }

    const confirmPaidInvoiceEmail = () => {
        setConfirmingPaidInvoiceEmail(false)
        setDialogOpen(true)
    }

    return {
        dialogOpen,
        setDialogOpen,
        confirmingUnsavedEmail,
        setConfirmingUnsavedEmail,
        confirmingPaidInvoiceEmail,
        setConfirmingPaidInvoiceEmail,
        requestEmail,
        confirmPaidInvoiceEmail,
    }
}
