import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { downloadInvoiceXml } from '../invoice-api'

type Options = {
    invoiceNumber: string
    canExport: boolean
    canSave: boolean
}

export function useInvoiceXmlExport({ invoiceNumber, canExport, canSave }: Options) {
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [confirmingExport, setConfirmingExport] = useState(false)

    const exportXml = async () => {
        if (!canExport) {
            if (canSave) setConfirmingExport(true)
            return
        }
        if (isExporting) return
        setIsExporting(true)
        setExportError(null)
        try {
            await downloadInvoiceXml(invoiceNumber.trim(), getSelectedBusinessYear())
        } catch (error) {
            setExportError(error instanceof Error ? error.message : 'XML export failed')
        } finally {
            setIsExporting(false)
        }
    }

    return {
        exportXml, exportError, isExporting, confirmingExport, setConfirmingExport,
    }
}
