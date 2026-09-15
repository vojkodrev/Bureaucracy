import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { invoicePdfUrl } from '../invoice-api'

type Options = { invoiceNumber: string; canPrint: boolean; canSave: boolean }

export function useInvoicePrint({ invoiceNumber, canPrint, canSave }: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const [confirmingPrint, setConfirmingPrint] = useState(false)

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

    return { printInvoice, printError, setPrintError, confirmingPrint, setConfirmingPrint }
}
