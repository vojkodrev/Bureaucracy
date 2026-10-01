import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateForApi } from '@/lib/dates'
import { emptyToNull } from '@/lib/form-input'
import { nextPaddedNumber, numberOrNull } from '@/lib/numbers'
import { postalCodeAndCity } from '@/lib/postal-address'
import { toast } from '@/lib/toast'
import type { InvoiceNumberWarning } from '../InvoiceNumberAlert'
import { fetchInvoiceExists, fetchLatestInvoiceNumber, postSaveInvoice } from '../invoice-api'
import type { InvoiceDraft } from './useInvoiceDraft'

type Options = {
    invoiceId: number | null
    draft: InvoiceDraft
    routeInvoiceNumber?: string
    isLoading: boolean
    loadError: string | null
    navigate: NavigateFunction
    markClean: (draft: InvoiceDraft) => void
    allowNavigation: () => void
    reloadAfterSave: () => void
}

export function useInvoiceSave({
    invoiceId, draft, routeInvoiceNumber, isLoading, loadError, navigate, markClean,
    allowNavigation, reloadAfterSave,
}: Options) {
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [invoiceNumberWarning, setInvoiceNumberWarning] = useState<InvoiceNumberWarning | null>(null)
    const canSave = Boolean(draft.invoiceNumber.trim()) && !isLoading && !loadError &&
        (!routeInvoiceNumber || invoiceId != null || draft.invoiceNumber !== routeInvoiceNumber)

    const performSave = async () => {
        const isCreating = invoiceId == null
        try {
            const result = await postSaveInvoice({
                businessYear: getSelectedBusinessYear(),
                invoice: {
                    id: invoiceId, invoiceNumber: draft.invoiceNumber.trim(),
                    issueDate: dateForApi(draft.invoiceDate), serviceDate: dateForApi(draft.serviceDate),
                    dueDate: dateForApi(draft.dueDate), paymentDate: dateForApi(draft.paymentDate),
                    customerCode: emptyToNull(draft.customerId), customerName: emptyToNull(draft.customerName),
                    customerAddress: emptyToNull(draft.customerAddress),
                    customerCity: emptyToNull(postalCodeAndCity(
                        draft.customerPostalCode, draft.customerCity,
                    )),
                    paidAmount: numberOrNull(draft.paidAmount),
                    purchaseOrderNumber: emptyToNull(draft.purchaseOrderNumber),
                    deliveryNoteNumber: emptyToNull(draft.deliveryNoteNumber),
                    introductoryText: emptyToNull(draft.introductoryText),
                    closingText: emptyToNull(draft.closingText),
                    items: draft.invoiceItems.map((item, index) => ({
                        id: item.id > 0 ? item.id : null, sequence: index + 1,
                        productCode: item.productCode?.trim() ?? '',
                        taxCode: item.taxCode?.trim() ?? '', quantity: item.quantity,
                        discount: item.discount, netAmount: item.netAmount, grossAmount: item.grossAmount,
                    })),
                },
            })
            const savedInvoice = result.data?.saveInvoice
            if (!savedInvoice) throw new Error('Saving invoice returned no invoice')
            toast.add({
                title: 'Invoice saved',
                description: `Invoice ${savedInvoice.invoiceNumber} was ${isCreating ? 'created' : 'updated'} successfully.`,
                type: 'success',
            })
            markClean(draft)
            if (routeInvoiceNumber === savedInvoice.invoiceNumber) reloadAfterSave()
            else {
                allowNavigation()
                navigate(`/invoice/${encodeURIComponent(savedInvoice.invoiceNumber)}`)
            }
            return true
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Saving invoice failed')
            return false
        }
    }

    const requestSave = async () => {
        if (!canSave || isSaving) return false
        setIsSaving(true)
        setSaveError(null)
        try {
            const number = draft.invoiceNumber.trim()
            if (invoiceId == null && await fetchInvoiceExists(number)) {
                setInvoiceNumberWarning({ kind: 'duplicate' })
                return false
            }
            const latest = await fetchLatestInvoiceNumber()
            if (number !== latest && number !== nextPaddedNumber(latest, 5)) {
                const numberValue = Number.parseInt(number, 10)
                const nextValue = Number.parseInt(nextPaddedNumber(latest, 5), 10)
                setInvoiceNumberWarning({
                    kind: numberValue > nextValue ? 'skipped' : 'historical',
                    latestInvoiceNumber: latest,
                })
                return false
            }
            return await performSave()
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Checking latest invoice failed')
            return false
        } finally {
            setIsSaving(false)
        }
    }

    const confirmSave = async () => {
        if (!canSave || isSaving) return false
        setInvoiceNumberWarning(null)
        setIsSaving(true)
        setSaveError(null)
        try { return await performSave() }
        finally { setIsSaving(false) }
    }

    return {
        canSave, requestSave, confirmSave, isSaving, saveError, setSaveError,
        invoiceNumberWarning, setInvoiceNumberWarning,
    }
}
