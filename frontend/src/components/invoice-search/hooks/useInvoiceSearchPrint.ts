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
    const [unavailableRemindersAction, setUnavailableRemindersAction] =
        useState<'print' | 'email' | null>(null)
    const canPrint = !isLoading && !hasError && hasResults
    const canPrintReminders = canPrint
        && search.resultsView === 'customer'
        && Boolean(search.customerId.trim() || search.customerName.trim())
        && customerSummaryCount === 1
    const unavailableRemindersDescription = (() => {
        if (isLoading) return 'Wait for the invoice search to finish, then try again.'
        if (hasError) return 'Resolve the invoice search error, then try again.'
        if (!hasResults) return 'No invoices match the current search.'
        if (search.resultsView !== 'customer') {
            return 'Switch the results view to Customers before printing or emailing reminders.'
        }
        if (!search.customerId.trim() && !search.customerName.trim()) {
            return 'Filter the search by customer ID or customer name first.'
        }
        return 'The search must match exactly one customer. Refine the customer filter and try again.'
    })()

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
        if (!canPrintReminders) {
            setUnavailableRemindersAction('print')
            return
        }
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

    return {
        canPrint,
        canPrintReminders,
        printReport,
        printReminders,
        printError,
        unavailableRemindersAction,
        unavailableRemindersDescription,
        showEmailRemindersUnavailable: () => setUnavailableRemindersAction('email'),
        closeUnavailableRemindersAlert: () => setUnavailableRemindersAction(null),
    }
}
