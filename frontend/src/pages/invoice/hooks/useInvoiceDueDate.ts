import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateAfterDays } from '@/lib/dates'
import { fetchCustomerPaymentTerm } from '../invoice-api'

type Options = {
    customerId: string
    invoiceDate?: Date
    setDueDate: (date?: Date) => void
}

export function useInvoiceDueDate({ customerId, invoiceDate, setDueDate }: Options) {
    const [isRecalculating, setIsRecalculating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const canRecalculate = Boolean(customerId && invoiceDate)

    const recalculate = async () => {
        if (!canRecalculate || isRecalculating) return
        setIsRecalculating(true)
        setError(null)
        try {
            const paymentTerm = await fetchCustomerPaymentTerm(
                customerId, getSelectedBusinessYear(),
            )
            setDueDate(dateAfterDays(invoiceDate, paymentTerm))
        } catch (requestError: unknown) {
            setError(requestError instanceof Error
                ? requestError.message : 'Loading customer payment term failed')
        } finally {
            setIsRecalculating(false)
        }
    }

    return { recalculate, canRecalculate, isRecalculating, error }
}
