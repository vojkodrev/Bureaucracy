import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from '@/lib/toast'
import { dateFromSearchValue } from '@/lib/dates'
import type { Invoice } from '@/lib/invoice-types'
import {
    fetchBusinessYear, fetchInvoice, fetchInvoiceTextTemplate, fetchNextInvoiceNumber,
} from '../invoice-api'
import type { InvoiceDraft } from './useInvoiceDraft'

export type InvoiceRequestErrors = Partial<Record<
    | 'nextInvoiceNumber' | 'invoiceTextTemplate' | 'businessYear'
    | 'currentBusinessYear' | 'duplicateInvoiceNumber' | 'customerPaymentTerm', string
>>

const requestErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback
const wasAborted = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'
const dateFromInvoiceValue = (value: string | null | undefined) =>
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined

function draftFromInvoice(invoice: Invoice): InvoiceDraft {
    return {
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerCode ?? '', customerName: invoice.customerName ?? '',
        customerAddress: invoice.customerAddress ?? '',
        customerPostalCode: invoice.customerPostalCode ?? '',
        customerCity: invoice.customerCity ?? '', customerCountry: invoice.customerCountry ?? '',
        invoiceDate: dateFromInvoiceValue(invoice.issueDate),
        serviceDate: dateFromInvoiceValue(invoice.serviceDate),
        dueDate: dateFromInvoiceValue(invoice.dueDate),
        paymentDate: dateFromInvoiceValue(invoice.paymentDate),
        paidAmount: invoice.paidAmount == null ? '' : String(invoice.paidAmount),
        introductoryText: invoice.introductoryText ?? '', closingText: invoice.closingText ?? '',
        invoiceItems: invoice.items ?? [],
    }
}

type Options = {
    routeInvoiceNumber?: string
    replaceDraft: (draft: InvoiceDraft) => void
    markClean: (draft: InvoiceDraft) => void
    clearCleanDraft: () => void
    disallowNavigation: () => void
}

export function useInvoiceLoader({
    routeInvoiceNumber, replaceDraft, markClean, clearCleanDraft, disallowNavigation,
}: Options) {
    const preserveDuplicateRef = useRef(false)
    const pendingRevertRef = useRef(false)
    const [invoiceId, setInvoiceId] = useState<number | null>(null)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const [requestErrors, setRequestErrors] = useState<InvoiceRequestErrors>({})
    const replaceLoadedDraft = useEffectEvent(replaceDraft)
    const markLoadedDraftClean = useEffectEvent(markClean)
    const clearLoadedDraft = useEffectEvent(clearCleanDraft)
    const finishNavigation = useEffectEvent(disallowNavigation)
    const requestKey = `${routeInvoiceNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState({ requestKey: '__initial__', error: null as string | null })
    const isLoading = Boolean(routeInvoiceNumber) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null

    useEffect(() => {
        if (!routeInvoiceNumber) return
        const controller = new AbortController()
        void fetchInvoice(routeInvoiceNumber, controller.signal).then((invoice) => {
            const nextDraft = draftFromInvoice(invoice)
            setInvoiceId(invoice.id ?? null)
            replaceLoadedDraft(nextDraft)
            markLoadedDraftClean(nextDraft)
            finishNavigation()
            setLoadResult({ requestKey, error: null })
            if (pendingRevertRef.current) {
                pendingRevertRef.current = false
                toast.add({
                    title: 'Invoice reverted',
                    description: `Invoice ${invoice.invoiceNumber} was restored to its last saved version.`,
                    type: 'success',
                })
            }
        }).catch((requestError: unknown) => {
            if (wasAborted(requestError)) return
            pendingRevertRef.current = false
            setLoadResult({ requestKey, error: requestErrorMessage(requestError, 'Loading invoice failed') })
        })
        return () => controller.abort()
    }, [requestKey, routeInvoiceNumber])

    useEffect(() => {
        if (routeInvoiceNumber) return
        if (preserveDuplicateRef.current) {
            preserveDuplicateRef.current = false
            finishNavigation()
            return
        }
        finishNavigation()
        const today = new Date()
        const initialDraft: InvoiceDraft = {
            invoiceNumber: '', customerId: '', customerName: '', customerAddress: '',
            customerPostalCode: '', customerCity: '', customerCountry: '', invoiceDate: today,
            serviceDate: undefined, dueDate: undefined, paymentDate: undefined, paidAmount: '',
            introductoryText: '', closingText: '', invoiceItems: [],
        }
        setInvoiceId(null)
        replaceLoadedDraft(initialDraft)
        clearLoadedDraft()
        setRequestErrors((current) => ({
            ...current, nextInvoiceNumber: undefined, invoiceTextTemplate: undefined,
        }))
        const controller = new AbortController()
        const templatePromise = fetchInvoiceTextTemplate(controller.signal).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) setRequestErrors((current) => ({
                ...current,
                invoiceTextTemplate: requestErrorMessage(requestError, 'Loading invoice text template failed'),
            }))
            return { introductoryText: null, closingText: null }
        })
        void Promise.all([fetchNextInvoiceNumber(controller.signal), templatePromise])
            .then(([invoiceNumber, template]) => {
                const nextDraft = {
                    ...initialDraft, invoiceNumber,
                    introductoryText: template.introductoryText ?? '',
                    closingText: template.closingText ?? '',
                }
                setRequestErrors((current) => ({ ...current, nextInvoiceNumber: undefined }))
                replaceLoadedDraft(nextDraft)
                markLoadedDraftClean(nextDraft)
            }).catch((requestError: unknown) => {
                if (!wasAborted(requestError)) setRequestErrors((current) => ({
                    ...current,
                    nextInvoiceNumber: requestErrorMessage(requestError, 'Loading next invoice number failed'),
                }))
            })
        return () => controller.abort()
    }, [routeInvoiceNumber])

    useEffect(() => {
        const controller = new AbortController()
        void fetchBusinessYear(controller.signal).then(setBusinessYear).catch((requestError: unknown) => {
            if (!wasAborted(requestError)) setRequestErrors((current) => ({
                ...current,
                businessYear: requestErrorMessage(requestError, 'Loading business year failed'),
            }))
        })
        return () => controller.abort()
    }, [])

    const reload = () => {
        pendingRevertRef.current = true
        setReloadVersion((version) => version + 1)
    }

    return {
        invoiceId, setInvoiceId, businessYear, setBusinessYear, isLoading, error,
        requestErrors, setRequestErrors, reload,
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => { preserveDuplicateRef.current = true },
    }
}
