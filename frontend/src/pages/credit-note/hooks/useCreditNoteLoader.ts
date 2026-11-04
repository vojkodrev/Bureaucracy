import { useEffect, useEffectEvent, useState } from 'react'
import { fetchBusinessYear } from '@/lib/business-year-api'
import { dateFromSearchValue } from '@/lib/dates'
import { cityWithoutPostalCode } from '@/lib/postal-address'
import { currencyCents, sumCurrencyCents } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import {
    takeInvoiceForCreditNote,
} from '@/pages/invoice/invoice-credit-note-conversion'
import {
    fetchCreditNote,
    fetchNextCreditNoteNumber,
} from '../credit-note-api'
import type { CreditNote } from '../types'
import type { CreditNoteDraft } from './useCreditNoteDraft'

const dateValue = (value: string | null | undefined) =>
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined

function draftFromCreditNote(note: CreditNote): CreditNoteDraft {
    return {
        creditNoteNumber: note.creditNoteNumber,
        customerId: note.customerCode ?? '',
        customerName: note.customerName ?? '',
        customerAddress: note.customerAddress ?? '',
        customerPostalCode: note.customerPostalCode ?? '',
        customerCity: cityWithoutPostalCode(note.customerCity, note.customerPostalCode),
        customerCountry: note.customerCountry ?? '',
        issueDate: dateValue(note.issueDate),
        serviceDate: dateValue(note.serviceDate),
        dueDate: dateValue(note.dueDate),
        introductoryText: note.introductoryText ?? '',
        closingText: note.closingText ?? '',
        items: note.items ?? [],
    }
}

type Options = {
    routeNumber?: string
    replaceDraft: (draft: CreditNoteDraft) => void
    markClean: (draft: CreditNoteDraft) => void
    clearCleanDraft: () => void
    disallowNavigation: () => void
}

type CreditNoteRequestErrors = Partial<Record<
    'nextCreditNoteNumber' | 'businessYear',
    string
>>

export function useCreditNoteLoader(options: Options) {
    const [creditNoteId, setCreditNoteId] = useState<number | null>(null)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [warnings, setWarnings] = useState<string[]>([])
    const [requestErrors, setRequestErrors] = useState<CreditNoteRequestErrors>({})
    const [isLoading, setIsLoading] = useState(Boolean(options.routeNumber))
    const [reloadVersion, setReloadVersion] = useState(0)
    const replaceDraft = useEffectEvent(options.replaceDraft)
    const markClean = useEffectEvent(options.markClean)
    const clearCleanDraft = useEffectEvent(options.clearCleanDraft)
    const disallowNavigation = useEffectEvent(options.disallowNavigation)

    useEffect(() => {
        const controller = new AbortController()
        setError(null)
        if (options.routeNumber) {
            setIsLoading(true)
            void fetchCreditNote(options.routeNumber, controller.signal)
                .then((note) => {
                    const nextDraft = draftFromCreditNote(note)
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
                    setCreditNoteId(note.id)
                    replaceDraft(nextDraft)
                    markClean(nextDraft)
                    disallowNavigation()
                    setWarnings([
                        ...(headerTotal === lineTotal
                            ? []
                            : ['credit-note-total']),
                        ...(hasInconsistentLine
                            ? ['credit-note-line-total']
                            : []),
                    ])
                })
                .catch((reason: unknown) => {
                    if (!controller.signal.aborted) {
                        setError(reason instanceof Error
                            ? reason.message
                            : 'Loading credit note failed')
                        setWarnings([])
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsLoading(false)
                })
        } else {
            setCreditNoteId(null)
            setWarnings([])
            disallowNavigation()
            const initialDraft: CreditNoteDraft = {
                ...draftFromCreditNote({
                    id: 0,
                    creditNoteNumber: '',
                    issueDate: null,
                    serviceDate: null,
                    dueDate: null,
                    customerCode: null,
                    customerName: null,
                    currency: null,
                    amount: null,
                }),
                issueDate: new Date(),
                serviceDate: new Date(),
            }
            replaceDraft(initialDraft)
            clearCleanDraft()
            void fetchNextCreditNoteNumber(controller.signal)
                .then((creditNoteNumber) => {
                    const nextDraft = { ...initialDraft, creditNoteNumber }
                    const invoice = takeInvoiceForCreditNote()
                    const convertedDraft: CreditNoteDraft = invoice ? {
                        ...nextDraft,
                        customerId: invoice.customerId,
                        customerName: invoice.customerName,
                        customerAddress: invoice.customerAddress,
                        customerPostalCode: invoice.customerPostalCode,
                        customerCity: invoice.customerCity,
                        customerCountry: invoice.customerCountry,
                        introductoryText: invoice.introductoryText,
                        closingText: invoice.closingText,
                        items: invoice.items.map((item, index) => ({
                            ...item,
                            id: -index - 1,
                        })),
                    } : nextDraft
                    replaceDraft(convertedDraft)
                    markClean(nextDraft)
                    if (invoice) {
                        toast.add({
                            title: 'Invoice converted',
                            description: 'The credit note draft has been ' +
                                'populated. Review and save it when ready.',
                            type: 'success',
                        })
                    }
                    setRequestErrors((current) => ({
                        ...current,
                        nextCreditNoteNumber: undefined,
                    }))
                })
                .catch((reason: unknown) => {
                    if (!controller.signal.aborted) {
                        setRequestErrors((current) => ({
                            ...current,
                            nextCreditNoteNumber: reason instanceof Error
                                ? reason.message
                                : 'Loading next credit note number failed',
                        }))
                    }
                })
        }
        return () => controller.abort()
    }, [options.routeNumber, reloadVersion])

    useEffect(() => {
        const controller = new AbortController()
        void fetchBusinessYear(controller.signal)
            .then((year) => {
                setBusinessYear(year)
                setRequestErrors((current) => ({
                    ...current,
                    businessYear: undefined,
                }))
            })
            .catch((reason: unknown) => {
                setBusinessYear(null)
                setRequestErrors((current) => ({
                    ...current,
                    businessYear: reason instanceof Error
                        ? reason.message
                        : 'Loading business year failed',
                }))
            })
        return () => controller.abort()
    }, [])

    return {
        creditNoteId,
        businessYear,
        error,
        warnings,
        requestErrors,
        isLoading,
        reload: () => setReloadVersion((value) => value + 1),
    }
}
