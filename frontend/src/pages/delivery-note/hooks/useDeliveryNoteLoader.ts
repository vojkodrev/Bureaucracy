import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { fetchBusinessYear } from '@/lib/business-year-api'
import { dateFromSearchValue } from '@/lib/dates'
import { cityWithoutPostalCode } from '@/lib/postal-address'
import { currencyCents, sumCurrencyCents } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import {
    fetchTextTemplate,
    TextTemplateDocumentType,
} from '@/lib/text-template-api'
import { takeInvoiceForDeliveryNote } from '@/pages/invoice/invoice-delivery-note-conversion'
import {
    fetchDeliveryNote,
    fetchNextDeliveryNoteNumber,
} from '@/pages/delivery-note-search/delivery-note-search-api'
import type { DeliveryNote } from '@/pages/delivery-note-search/types'
import type { DeliveryNoteDraft } from './useDeliveryNoteDraft'

export type DeliveryNoteRequestErrors = Partial<Record<
    | 'nextNumber'
    | 'textTemplate'
    | 'businessYear'
    | 'currentBusinessYear'
    | 'duplicateNumber',
    string
>>

const errorMessage = (error: unknown, fallback: string) => (
    error instanceof Error ? error.message : fallback
)
const wasAborted = (error: unknown) => (
    error instanceof DOMException && error.name === 'AbortError'
)
const dateFromValue = (value: string | null | undefined) => (
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined
)

function draftFromDeliveryNote(note: DeliveryNote): DeliveryNoteDraft {
    return {
        deliveryNoteNumber: note.deliveryNoteNumber,
        customerId: note.customerCode ?? '',
        customerName: note.customerName ?? '',
        customerAddress: note.customerAddress ?? '',
        customerPostalCode: note.customerPostalCode ?? '',
        customerCity: cityWithoutPostalCode(
            note.customerCity,
            note.customerPostalCode,
        ),
        customerCountry: note.customerCountry ?? '',
        issueDate: dateFromValue(note.issueDate),
        deliveryDate: dateFromValue(note.deliveryDate),
        introductoryText: note.introductoryText ?? '',
        closingText: note.closingText ?? '',
        withoutAmounts: note.withoutAmounts,
        items: note.items ?? [],
    }
}

type Options = {
    routeNumber?: string
    replaceDraft: (draft: DeliveryNoteDraft) => void
    markClean: (draft: DeliveryNoteDraft) => void
    clearCleanDraft: () => void
    disallowNavigation: () => void
}

export function useDeliveryNoteLoader(options: Options) {
    const preserveDuplicate = useRef(false)
    const pendingRevert = useRef(false)
    const [deliveryNoteId, setDeliveryNoteId] = useState<number | null>(null)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const [requestErrors, setRequestErrors] = useState<
        DeliveryNoteRequestErrors
    >({})
    const replaceLoadedDraft = useEffectEvent(options.replaceDraft)
    const markLoadedDraftClean = useEffectEvent(options.markClean)
    const clearLoadedDraft = useEffectEvent(options.clearCleanDraft)
    const finishNavigation = useEffectEvent(options.disallowNavigation)
    const requestKey = `${options.routeNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState({
        requestKey: '__initial__',
        error: null as string | null,
    })
    const [warningResult, setWarningResult] = useState({
        requestKey: '__initial__',
        warnings: [] as string[],
        storedTotal: null as number | null,
    })
    const isLoading = Boolean(options.routeNumber)
        && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey
        ? loadResult.error
        : null
    const warnings = warningResult.requestKey === requestKey
        ? warningResult.warnings
        : []
    const storedTotal = warningResult.requestKey === requestKey
        ? warningResult.storedTotal
        : null

    useEffect(() => {
        if (!options.routeNumber) return
        const controller = new AbortController()
        void fetchDeliveryNote(options.routeNumber, controller.signal)
            .then((note) => {
                const nextDraft = draftFromDeliveryNote(note)
                const headerTotal = currencyCents(note.amount ?? 0)
                const lineTotal = sumCurrencyCents(
                    (note.items ?? []).map((item) => item.grossAmount),
                )
                const hasInconsistentLine = (note.items ?? []).some((item) => {
                    const netTotal = currencyCents(item.netAmount ?? 0)
                    const vatTotal = currencyCents(
                        (item.netAmount ?? 0) * (item.taxRate ?? 0) / 100,
                    )
                    return currencyCents(item.grossAmount ?? 0) !==
                        netTotal + vatTotal
                })
                setDeliveryNoteId(note.id ?? null)
                replaceLoadedDraft(nextDraft)
                markLoadedDraftClean(nextDraft)
                finishNavigation()
                setLoadResult({ requestKey, error: null })
                setWarningResult({
                    requestKey,
                    warnings: [
                        ...(headerTotal === lineTotal ? [] : ['delivery-note-total']),
                        ...(hasInconsistentLine ? ['delivery-note-line-total'] : []),
                    ],
                    storedTotal: headerTotal === lineTotal ? null : (note.amount ?? 0),
                })
                if (pendingRevert.current) {
                    pendingRevert.current = false
                    toast.add({
                        title: 'Delivery note reverted',
                        description: `Delivery note ${note.deliveryNoteNumber} was restored.`,
                        type: 'success',
                    })
                }
            })
            .catch((requestError: unknown) => {
                if (wasAborted(requestError)) return
                pendingRevert.current = false
                setLoadResult({
                    requestKey,
                    error: errorMessage(
                        requestError,
                        'Loading delivery note failed',
                    ),
                })
                setWarningResult({ requestKey, warnings: [], storedTotal: null })
            })
        return () => controller.abort()
    }, [requestKey, options.routeNumber])

    useEffect(() => {
        if (options.routeNumber) return
        if (preserveDuplicate.current) {
            preserveDuplicate.current = false
            finishNavigation()
            return
        }
        finishNavigation()
        const initialDraft: DeliveryNoteDraft = {
            deliveryNoteNumber: '',
            customerId: '',
            customerName: '',
            customerAddress: '',
            customerPostalCode: '',
            customerCity: '',
            customerCountry: '',
            issueDate: new Date(),
            deliveryDate: new Date(),
            introductoryText: '',
            closingText: '',
            withoutAmounts: false,
            items: [],
        }
        setDeliveryNoteId(null)
        replaceLoadedDraft(initialDraft)
        clearLoadedDraft()
        setRequestErrors((current) => ({
            ...current,
            nextNumber: undefined,
            textTemplate: undefined,
        }))
        const controller = new AbortController()
        const templatePromise = fetchTextTemplate(
            TextTemplateDocumentType.DeliveryNote, controller.signal,
        ).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) {
                setRequestErrors((current) => ({
                    ...current,
                    textTemplate: errorMessage(
                        requestError,
                        'Loading delivery note text template failed',
                    ),
                }))
            }
            return { introductoryText: null, closingText: null }
        })
        void Promise.all([
            fetchNextDeliveryNoteNumber(controller.signal),
            templatePromise,
        ]).then(([number, template]) => {
            const nextDraft = {
                ...initialDraft,
                deliveryNoteNumber: number,
                introductoryText: template.introductoryText ?? '',
                closingText: template.closingText ?? '',
            }
            const invoice = takeInvoiceForDeliveryNote()
            const convertedDraft: DeliveryNoteDraft = invoice ? {
                ...nextDraft,
                customerId: invoice.customerId,
                customerName: invoice.customerName,
                customerAddress: invoice.customerAddress,
                customerPostalCode: invoice.customerPostalCode,
                customerCity: invoice.customerCity,
                customerCountry: invoice.customerCountry,
                introductoryText: [
                    nextDraft.introductoryText, invoice.introductoryText,
                ].filter(Boolean).join('\n'),
                closingText: nextDraft.closingText || invoice.closingText,
                items: invoice.items.map((item, index) => ({
                    ...item, id: -index - 1,
                })),
            } : nextDraft
            replaceLoadedDraft(convertedDraft)
            markLoadedDraftClean(nextDraft)
            if (invoice) toast.add({
                title: 'Invoice converted',
                description: 'The delivery note draft has been populated. Review and save it when ready.',
                type: 'success',
            })
        }).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) {
                setRequestErrors((current) => ({
                    ...current,
                    nextNumber: errorMessage(
                        requestError,
                        'Loading next delivery note number failed',
                    ),
                }))
            }
        })
        return () => controller.abort()
    }, [options.routeNumber])

    useEffect(() => {
        const controller = new AbortController()
        void fetchBusinessYear(controller.signal)
            .then(setBusinessYear)
            .catch((requestError: unknown) => {
                if (!wasAborted(requestError)) {
                    setRequestErrors((current) => ({
                        ...current,
                        businessYear: errorMessage(
                            requestError,
                            'Loading business year failed',
                        ),
                    }))
                }
            })
        return () => controller.abort()
    }, [])

    return {
        deliveryNoteId,
        setDeliveryNoteId,
        businessYear,
        setBusinessYear,
        isLoading,
        error,
        warnings,
        storedTotal,
        requestErrors,
        setRequestErrors,
        reload: () => {
            pendingRevert.current = true
            setReloadVersion((version) => version + 1)
        },
        reloadAfterSave: () => {
            setReloadVersion((version) => version + 1)
        },
        preserveDuplicateDraft: () => { preserveDuplicate.current = true },
    }
}
