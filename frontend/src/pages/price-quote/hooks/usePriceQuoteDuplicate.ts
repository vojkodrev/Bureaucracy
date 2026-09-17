import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { getSelectedBusinessYear, setSelectedBusinessYear } from '@/lib/business-year'
import { fetchCurrentBusinessYear } from '@/lib/business-year-api'
import { dateAfterDays } from '@/lib/dates'
import { toast } from '@/lib/toast'
import {
    fetchCustomerPaymentTerm, fetchNextPriceQuoteNumber,
} from '@/pages/price-quote-search/price-quote-search-api'
import type { PriceQuoteDraft } from './usePriceQuoteDraft'
import type { PriceQuoteRequestErrors } from './usePriceQuoteLoader'

type Options = {
    priceQuoteId: number | null
    businessYear: number | null
    draft: PriceQuoteDraft
    hasUnsavedChanges: boolean
    navigate: NavigateFunction
    replaceDraft: (draft: PriceQuoteDraft) => void
    markUnsaved: () => void
    setPriceQuoteId: (id: number | null) => void
    setBusinessYear: (year: number | null) => void
    setRequestErrors: React.Dispatch<React.SetStateAction<PriceQuoteRequestErrors>>
    preserveDuplicateDraft: () => void
    allowNavigation: () => void
}

export function usePriceQuoteDuplicate(options: Options) {
    const {
        priceQuoteId, businessYear, draft, hasUnsavedChanges, navigate, replaceDraft,
        markUnsaved, setPriceQuoteId, setBusinessYear, setRequestErrors,
        preserveDuplicateDraft, allowNavigation,
    } = options
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)

    const performDuplicate = async () => {
        if (priceQuoteId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        setRequestErrors((current) => ({
            ...current, currentBusinessYear: undefined,
            duplicatePriceQuoteNumber: undefined, customerPaymentTerm: undefined,
        }))
        try {
            const currentYear = await fetchCurrentBusinessYear()
            const [numberResult, termResult] = await Promise.allSettled([
                fetchNextPriceQuoteNumber(undefined, currentYear.code),
                fetchCustomerPaymentTerm(draft.customerId, currentYear.code),
            ])
            const errors: PriceQuoteRequestErrors = {}
            if (numberResult.status === 'rejected') errors.duplicatePriceQuoteNumber =
                numberResult.reason instanceof Error
                    ? numberResult.reason.message : 'Loading duplicate price quote number failed'
            if (termResult.status === 'rejected') errors.customerPaymentTerm =
                termResult.reason instanceof Error
                    ? termResult.reason.message : 'Loading customer payment term failed'
            if (numberResult.status === 'rejected' || termResult.status === 'rejected') {
                setRequestErrors((current) => ({ ...current, ...errors }))
                return
            }
            const issueDate = new Date()
            if (businessYear !== currentYear.year || currentYear.code !== getSelectedBusinessYear()) {
                setSelectedBusinessYear(currentYear.code)
                setBusinessYear(currentYear.year)
            }
            const duplicateDraft: PriceQuoteDraft = {
                ...draft, quoteNumber: numberResult.value, issueDate,
                dueDate: dateAfterDays(issueDate, termResult.value),
                items: draft.items.map((item, index) => ({ ...item, id: -index - 1 })),
            }
            setPriceQuoteId(null)
            replaceDraft(duplicateDraft)
            markUnsaved()
            preserveDuplicateDraft()
            allowNavigation()
            navigate('/price-quote')
            toast.add({
                title: 'Price quote duplicated',
                description: `Price quote number ${numberResult.value} has been assigned to the new unsaved copy. You can review and edit it before saving.`,
                type: 'info',
            })
        } catch (error: unknown) {
            setRequestErrors((current) => ({
                ...current,
                currentBusinessYear: error instanceof Error
                    ? error.message : 'Loading current business year failed',
            }))
        } finally { setIsDuplicating(false) }
    }

    const duplicate = async () => {
        if (priceQuoteId == null || isDuplicating) return
        if (hasUnsavedChanges) { setConfirmingDuplicate(true); return }
        await performDuplicate()
    }

    return { duplicate, performDuplicate, isDuplicating, confirmingDuplicate, setConfirmingDuplicate }
}
