import { useEffect, useState } from 'react'
import type { MissingBankStatementDate } from '@/lib/bank-statement-types'
import { fetchMissingBankStatementDates } from '../bank-statement-search-api'

export function useMissingBankStatementDates() {
    const [missingDates, setMissingDates] = useState<MissingBankStatementDate[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        void fetchMissingBankStatementDates(controller.signal)
            .then((dates) => {
                setMissingDates(dates)
                setError(null)
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setMissingDates([])
                setError(requestError instanceof Error
                    ? requestError.message
                    : 'Missing bank statement check failed')
            })
        return () => controller.abort()
    }, [])

    return { missingDates, error }
}
