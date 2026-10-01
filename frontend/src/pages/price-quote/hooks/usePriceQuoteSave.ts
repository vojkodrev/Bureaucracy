import { useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { dateForApi } from '@/lib/dates'
import { emptyToNull } from '@/lib/form-input'
import { nextPaddedNumber } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import {
    fetchLatestPriceQuoteNumber, fetchPriceQuoteExists, savePriceQuote,
} from '@/pages/price-quote-search/price-quote-search-api'
import type { PriceQuoteNumberWarning } from '../PriceQuoteNumberAlert'
import type { PriceQuoteDraft } from './usePriceQuoteDraft'

type Options = {
    priceQuoteId: number | null
    draft: PriceQuoteDraft
    routeQuoteNumber?: string
    isLoading: boolean
    loadError: string | null
    navigate: NavigateFunction
    markClean: (draft: PriceQuoteDraft) => void
    allowNavigation: () => void
    reloadAfterSave: () => void
}

export function usePriceQuoteSave({
    priceQuoteId, draft, routeQuoteNumber, isLoading, loadError, navigate, markClean,
    allowNavigation, reloadAfterSave,
}: Options) {
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [numberWarning, setNumberWarning] = useState<PriceQuoteNumberWarning | null>(null)
    const canSave = Boolean(draft.quoteNumber.trim()) && !isLoading && !loadError &&
        (!routeQuoteNumber || priceQuoteId != null || draft.quoteNumber !== routeQuoteNumber)

    const performSave = async () => {
        const isCreating = priceQuoteId == null
        try {
            const result = await savePriceQuote({
                id: priceQuoteId, quoteNumber: draft.quoteNumber.trim(),
                issueDate: dateForApi(draft.issueDate), dueDate: dateForApi(draft.dueDate),
                customerCode: emptyToNull(draft.customerId),
                customerName: emptyToNull(draft.customerName),
                customerAddress: emptyToNull(draft.customerAddress),
                customerCity: emptyToNull(draft.customerCity),
                introductoryText: emptyToNull(draft.introductoryText),
                closingText: emptyToNull(draft.closingText),
                items: draft.items.map((item, index) => ({
                    id: item.id > 0 ? item.id : null, sequence: index + 1,
                    productCode: item.productCode?.trim() ?? '', taxCode: item.taxCode?.trim() ?? '',
                    quantity: item.quantity, discount: item.discount,
                    netAmount: item.netAmount, grossAmount: item.grossAmount,
                })),
            })
            const saved = result.data?.savePriceQuote
            if (!saved) throw new Error('Saving price quote returned no price quote')
            toast.add({
                title: 'Price quote saved',
                description: `Price quote ${saved.quoteNumber} was ${isCreating ? 'created' : 'updated'} successfully.`,
                type: 'success',
            })
            markClean(draft)
            if (routeQuoteNumber === saved.quoteNumber) reloadAfterSave()
            else {
                allowNavigation()
                navigate(`/price-quote/${encodeURIComponent(saved.quoteNumber)}`)
            }
            return true
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Saving price quote failed')
            return false
        }
    }

    const requestSave = async () => {
        if (!canSave || isSaving) return false
        setIsSaving(true)
        setSaveError(null)
        try {
            const number = draft.quoteNumber.trim()
            if (priceQuoteId == null && await fetchPriceQuoteExists(number)) {
                setNumberWarning({ kind: 'duplicate' })
                return false
            }
            const latest = await fetchLatestPriceQuoteNumber()
            if (number !== latest && number !== nextPaddedNumber(latest, 5)) {
                const numberValue = Number.parseInt(number, 10)
                const nextValue = Number.parseInt(nextPaddedNumber(latest, 5), 10)
                setNumberWarning({
                    kind: numberValue > nextValue ? 'skipped' : 'historical',
                    latestPriceQuoteNumber: latest,
                })
                return false
            }
            return await performSave()
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : 'Checking latest price quote failed')
            return false
        } finally { setIsSaving(false) }
    }

    const confirmSave = async () => {
        if (!canSave || isSaving) return false
        setNumberWarning(null)
        setIsSaving(true)
        setSaveError(null)
        try { return await performSave() }
        finally { setIsSaving(false) }
    }

    return {
        canSave, requestSave, confirmSave, isSaving, saveError, setSaveError,
        numberWarning, setNumberWarning,
    }
}
