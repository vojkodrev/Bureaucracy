import { useEffect, useEffectEvent, useState } from 'react'
import { openAuthenticatedUrl } from '@/lib/auth'
import { bankStatementReportPdfUrl } from '../bank-statement-search-api'
import type { BankStatementSearchCriteria } from '../types'

type Options = {
    search: BankStatementSearchCriteria
    hasOutflows: boolean
    isLoading: boolean
    hasError: boolean
}

export function useBankStatementSearchPrint({ search, hasOutflows, isLoading, hasError }: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const canPrint = !isLoading && !hasError && hasOutflows

    const printReport = async () => {
        if (!canPrint) return
        try {
            await openAuthenticatedUrl(bankStatementReportPdfUrl(search))
            setPrintError(null)
        } catch (error) {
            setPrintError(error instanceof Error
                ? error.message
                : 'Could not open the bank statement outflow report PDF.')
        }
    }
    const onPrintShortcut = useEffectEvent(printReport)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return
            event.preventDefault()
            onPrintShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return { canPrint, printReport, printError }
}
