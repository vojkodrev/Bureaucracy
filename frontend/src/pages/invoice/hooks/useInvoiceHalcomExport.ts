import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { toast } from '@/lib/toast'
import { downloadInvoiceHalcom } from '../invoice-api'

type Options = {
    invoiceNumber: string
    canExport: boolean
    canSave: boolean
}

export function useInvoiceHalcomExport({ invoiceNumber, canExport, canSave }: Options) {
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [confirmingExport, setConfirmingExport] = useState(false)

    const exportHalcom = async () => {
        if (!canExport) {
            if (canSave) setConfirmingExport(true)
            return
        }
        if (isExporting) return
        setIsExporting(true)
        setExportError(null)
        toast.add({
            title: 'Halcom export requested',
            description: 'The invoice package downloads automatically when ready.',
            type: 'info',
        })
        try {
            await downloadInvoiceHalcom(invoiceNumber.trim(), getSelectedBusinessYear())
        } catch (error) {
            setExportError(error instanceof Error ? error.message : 'Halcom export failed')
        } finally {
            setIsExporting(false)
        }
    }

    return { exportHalcom, exportError, isExporting, confirmingExport, setConfirmingExport }
}
