import { useEffect, useEffectEvent, useState } from 'react'
import { invoiceRemindersPdfUrl, invoiceReportPdfUrl } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

type Options = {
    search: InvoiceSearchCriteria
    hasResults: boolean
    isLoading: boolean
    hasError: boolean
    customerSummaryCount: number
    keyboardShortcutEnabled: boolean
}

export function useInvoiceSearchPrint({
    search,
    hasResults,
    isLoading,
    hasError,
    customerSummaryCount,
    keyboardShortcutEnabled,
}: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const canPrint = !isLoading && !hasError && hasResults
    const canPrintReminders = canPrint
        && search.resultsView === 'customer'
        && Boolean(search.customerId.trim() || search.customerName.trim())
        && customerSummaryCount === 1

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
    const printReminders = () => {
        if (!canPrint || search.resultsView !== 'customer'
            || (!search.customerId.trim() && !search.customerName.trim())) return
        const pdfTab = window.open(invoiceRemindersPdfUrl(search), '_blank')
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the reminders PDF.')
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

    return { canPrint, canPrintReminders, printReport, printReminders, printError }
}
