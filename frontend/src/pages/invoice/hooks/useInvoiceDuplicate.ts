import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { getSelectedBusinessYear, setSelectedBusinessYear } from '@/lib/business-year'
import { dateAfterDays } from '@/lib/dates'
import { toast } from '@/lib/toast'
import {
    fetchCurrentBusinessYear, fetchCustomerPaymentTerm, fetchNextInvoiceNumber,
} from '../invoice-api'
import type { InvoiceRequestErrors } from './useInvoiceLoader'
import type { InvoiceDraft } from './useInvoiceDraft'

type Options = {
    invoiceId: number | null
    businessYear: number | null
    draft: InvoiceDraft
    hasUnsavedChanges: boolean
    navigate: NavigateFunction
    replaceDraft: (draft: InvoiceDraft) => void
    markUnsaved: () => void
    setInvoiceId: (id: number | null) => void
    setBusinessYear: (year: number | null) => void
    setRequestErrors: React.Dispatch<React.SetStateAction<InvoiceRequestErrors>>
    preserveDuplicateDraft: () => void
    allowNavigation: () => void
}

export function useInvoiceDuplicate(options: Options) {
    const {
        invoiceId, businessYear, draft, hasUnsavedChanges, navigate, replaceDraft, markUnsaved,
        setInvoiceId, setBusinessYear, setRequestErrors, preserveDuplicateDraft, allowNavigation,
    } = options
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)

    const performDuplicate = async () => {
        if (invoiceId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        setRequestErrors((current) => ({
            ...current, currentBusinessYear: undefined,
            duplicateInvoiceNumber: undefined, customerPaymentTerm: undefined,
        }))
        try {
            const currentYear = await fetchCurrentBusinessYear()
            const [numberResult, termResult] = await Promise.allSettled([
                fetchNextInvoiceNumber(undefined, currentYear.code),
                fetchCustomerPaymentTerm(draft.customerId, currentYear.code),
            ])
            const errors: InvoiceRequestErrors = {}
            if (numberResult.status === 'rejected') errors.duplicateInvoiceNumber =
                numberResult.reason instanceof Error ? numberResult.reason.message : 'Loading duplicate invoice number failed'
            if (termResult.status === 'rejected') errors.customerPaymentTerm =
                termResult.reason instanceof Error ? termResult.reason.message : 'Loading customer payment term failed'
            if (numberResult.status === 'rejected' || termResult.status === 'rejected') {
                setRequestErrors((current) => ({ ...current, ...errors }))
                return
            }
            const invoiceDate = new Date()
            if (businessYear !== currentYear.year || currentYear.code !== getSelectedBusinessYear()) {
                setSelectedBusinessYear(currentYear.code)
                setBusinessYear(currentYear.year)
            }
            const duplicateDraft: InvoiceDraft = {
                ...draft, invoiceNumber: numberResult.value, invoiceDate,
                dueDate: dateAfterDays(invoiceDate, termResult.value), paymentDate: undefined,
                paidAmount: '',
                invoiceItems: draft.invoiceItems.map((item, index) => ({ ...item, id: -index - 1 })),
            }
            setInvoiceId(null)
            replaceDraft(duplicateDraft)
            markUnsaved()
            preserveDuplicateDraft()
            allowNavigation()
            navigate('/invoice')
            toast.add({
                title: 'Invoice duplicated',
                description: `Invoice number ${numberResult.value} has been assigned to the new unsaved copy. You can review and edit it before saving.`,
                type: 'info',
            })
        } catch (error: unknown) {
            setRequestErrors((current) => ({
                ...current,
                currentBusinessYear: error instanceof Error ? error.message : 'Loading current business year failed',
            }))
        } finally { setIsDuplicating(false) }
    }

    const duplicate = async () => {
        if (invoiceId == null || isDuplicating) return
        if (hasUnsavedChanges) { setConfirmingDuplicate(true); return }
        await performDuplicate()
    }

    return { duplicate, performDuplicate, isDuplicating, confirmingDuplicate, setConfirmingDuplicate }
}
