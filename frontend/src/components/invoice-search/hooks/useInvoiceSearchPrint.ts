import { useEffect, useEffectEvent, useState } from 'react'
import { invoiceReportPdfUrl } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

type Options = {
    search: InvoiceSearchCriteria
    canPrint: boolean
    keyboardShortcutEnabled: boolean
}

export function useInvoiceSearchPrint({
    search,
    canPrint,
    keyboardShortcutEnabled,
}: Options) {
    const [printError, setPrintError] = useState<string | null>(null)

    const printReport = () => {
        if (!canPrint) return
        const pdfTab = window.open(invoiceReportPdfUrl(search), '_blank')
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the invoice report PDF.')
            return
        }
        pdfTab.opener = null
        setPrintError(null)
    }
    const onPrintShortcut = useEffectEvent(printReport)

    useEffect(() => {
        if (!keyboardShortcutEnabled) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return
            event.preventDefault()
            onPrintShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [keyboardShortcutEnabled])

    return { printReport, printError }
}
