import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { fetchBusinessYear } from '@/lib/business-year-api'
import { dateFromSearchValue } from '@/lib/dates'
import { toast } from '@/lib/toast'
import {
    fetchNextPriceQuoteNumber, fetchPriceQuote, fetchPriceQuoteTextTemplate,
} from '@/pages/price-quote-search/price-quote-search-api'
import type { PriceQuote } from '@/pages/price-quote-search/types'
import type { PriceQuoteDraft } from './usePriceQuoteDraft'

export type PriceQuoteRequestErrors = Partial<Record<
    | 'nextPriceQuoteNumber' | 'priceQuoteTextTemplate' | 'businessYear'
    | 'currentBusinessYear' | 'duplicatePriceQuoteNumber' | 'customerPaymentTerm', string
>>

const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback
const wasAborted = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'
const dateFromValue = (value: string | null | undefined) =>
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined

function draftFromPriceQuote(priceQuote: PriceQuote): PriceQuoteDraft {
    return {
        quoteNumber: priceQuote.quoteNumber,
        customerId: priceQuote.customerCode ?? '', customerName: priceQuote.customerName ?? '',
        customerAddress: priceQuote.customerAddress ?? '',
        customerPostalCode: priceQuote.customerPostalCode ?? '',
        customerCity: priceQuote.customerCity ?? '', customerCountry: priceQuote.customerCountry ?? '',
        issueDate: dateFromValue(priceQuote.issueDate), dueDate: dateFromValue(priceQuote.dueDate),
        introductoryText: priceQuote.introductoryText ?? '',
        closingText: priceQuote.closingText ?? '', items: priceQuote.items ?? [],
    }
}

type Options = {
    routeQuoteNumber?: string
    replaceDraft: (draft: PriceQuoteDraft) => void
    markClean: (draft: PriceQuoteDraft) => void
    clearCleanDraft: () => void
    disallowNavigation: () => void
}

export function usePriceQuoteLoader({
    routeQuoteNumber, replaceDraft, markClean, clearCleanDraft, disallowNavigation,
}: Options) {
    const preserveDuplicateRef = useRef(false)
    const pendingRevertRef = useRef(false)
    const [priceQuoteId, setPriceQuoteId] = useState<number | null>(null)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const [requestErrors, setRequestErrors] = useState<PriceQuoteRequestErrors>({})
    const replaceLoadedDraft = useEffectEvent(replaceDraft)
    const markLoadedDraftClean = useEffectEvent(markClean)
    const clearLoadedDraft = useEffectEvent(clearCleanDraft)
    const finishNavigation = useEffectEvent(disallowNavigation)
    const requestKey = `${routeQuoteNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState({
        requestKey: '__initial__', error: null as string | null,
    })
    const isLoading = Boolean(routeQuoteNumber) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null

    useEffect(() => {
        if (!routeQuoteNumber) return
        const controller = new AbortController()
        void fetchPriceQuote(routeQuoteNumber, controller.signal).then((priceQuote) => {
            const nextDraft = draftFromPriceQuote(priceQuote)
            setPriceQuoteId(priceQuote.id ?? null)
            replaceLoadedDraft(nextDraft)
            markLoadedDraftClean(nextDraft)
            finishNavigation()
            setLoadResult({ requestKey, error: null })
            if (pendingRevertRef.current) {
                pendingRevertRef.current = false
                toast.add({
                    title: 'Price quote reverted',
                    description: `Price quote ${priceQuote.quoteNumber} was restored to its last saved version.`,
                    type: 'success',
                })
            }
        }).catch((requestError: unknown) => {
            if (wasAborted(requestError)) return
            pendingRevertRef.current = false
            setLoadResult({ requestKey, error: errorMessage(requestError, 'Loading price quote failed') })
        })
        return () => controller.abort()
    }, [requestKey, routeQuoteNumber])

    useEffect(() => {
        if (routeQuoteNumber) return
        if (preserveDuplicateRef.current) {
            preserveDuplicateRef.current = false
            finishNavigation()
            return
        }
        finishNavigation()
        const initialDraft: PriceQuoteDraft = {
            quoteNumber: '', customerId: '', customerName: '', customerAddress: '',
            customerPostalCode: '', customerCity: '', customerCountry: '', issueDate: new Date(),
            dueDate: undefined, introductoryText: '', closingText: '', items: [],
        }
        setPriceQuoteId(null)
        replaceLoadedDraft(initialDraft)
        clearLoadedDraft()
        setRequestErrors((current) => ({
            ...current, nextPriceQuoteNumber: undefined, priceQuoteTextTemplate: undefined,
        }))
        const controller = new AbortController()
        const templatePromise = fetchPriceQuoteTextTemplate(controller.signal)
            .catch((requestError: unknown) => {
                if (!wasAborted(requestError)) setRequestErrors((current) => ({
                    ...current,
                    priceQuoteTextTemplate: errorMessage(requestError, 'Loading price quote text template failed'),
                }))
                return { introductoryText: null, closingText: null }
            })
        void Promise.all([fetchNextPriceQuoteNumber(controller.signal), templatePromise])
            .then(([quoteNumber, template]) => {
                const nextDraft = {
                    ...initialDraft, quoteNumber,
                    introductoryText: template.introductoryText ?? '',
                    closingText: template.closingText ?? '',
                }
                setRequestErrors((current) => ({ ...current, nextPriceQuoteNumber: undefined }))
                replaceLoadedDraft(nextDraft)
                markLoadedDraftClean(nextDraft)
            }).catch((requestError: unknown) => {
                if (!wasAborted(requestError)) setRequestErrors((current) => ({
                    ...current,
                    nextPriceQuoteNumber: errorMessage(requestError, 'Loading next price quote number failed'),
                }))
            })
        return () => controller.abort()
    }, [routeQuoteNumber])

    useEffect(() => {
        const controller = new AbortController()
        void fetchBusinessYear(controller.signal).then(setBusinessYear).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) setRequestErrors((current) => ({
                ...current, businessYear: errorMessage(requestError, 'Loading business year failed'),
            }))
        })
        return () => controller.abort()
    }, [])

    return {
        priceQuoteId, setPriceQuoteId, businessYear, setBusinessYear, isLoading, error,
        requestErrors, setRequestErrors,
        reload: () => {
            pendingRevertRef.current = true
            setReloadVersion((version) => version + 1)
        },
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => { preserveDuplicateRef.current = true },
    }
}
