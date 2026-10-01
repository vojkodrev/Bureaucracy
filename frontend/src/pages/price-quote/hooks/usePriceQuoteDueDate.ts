import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateAfterDays } from '@/lib/dates'
import { fetchCustomerPaymentTerm } from '@/pages/price-quote-search/price-quote-search-api'

type Options = {
    customerId: string
    issueDate?: Date
    setDueDate: (date?: Date) => void
}

export function usePriceQuoteDueDate({ customerId, issueDate, setDueDate }: Options) {
    const [isRecalculating, setIsRecalculating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const canRecalculate = Boolean(customerId && issueDate)

    const recalculate = async () => {
        if (!canRecalculate || isRecalculating) return
        setIsRecalculating(true)
        setError(null)
        try {
            const paymentTerm = await fetchCustomerPaymentTerm(
                customerId, getSelectedBusinessYear(),
            )
            setDueDate(dateAfterDays(issueDate, paymentTerm))
        } catch (requestError: unknown) {
            setError(requestError instanceof Error
                ? requestError.message : 'Loading customer payment term failed')
        } finally {
            setIsRecalculating(false)
        }
    }

    return { recalculate, canRecalculate, isRecalculating, error }
}
