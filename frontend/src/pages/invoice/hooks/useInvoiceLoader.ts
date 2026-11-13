import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from '@/lib/toast'
import { dateFromSearchValue } from '@/lib/dates'
import type { Invoice } from '@/lib/invoice-types'
import { fetchBusinessYear } from '@/lib/business-year-api'
import { cityWithoutPostalCode } from '@/lib/postal-address'
import { currencyCents, sumCurrencyCents } from '@/lib/numbers'
import {
    fetchTextTemplate,
    TextTemplateDocumentType,
} from '@/lib/text-template-api'
import { takeDeliveryNoteForInvoice } from '@/pages/delivery-note/delivery-note-invoice-conversion'
import { takePriceQuoteForInvoice } from '@/pages/price-quote/price-quote-invoice-conversion'
import {
    fetchInvoice, fetchNextInvoiceNumber,
} from '../invoice-api'
import type { InvoiceTaxConfirmation } from '../invoice-api'
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
const dateTimeFromInvoiceValue = (value: string | null | undefined) => {
    if (!value) return undefined
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (!match) return undefined
    const [, year, month, day, hours, minutes, seconds] = match
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds))
}

function draftFromInvoice(invoice: Invoice): InvoiceDraft {
    return {
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerCode ?? '', customerName: invoice.customerName ?? '',
        customerAddress: invoice.customerAddress ?? '',
        customerPostalCode: invoice.customerPostalCode ?? '',
        customerCity: cityWithoutPostalCode(invoice.customerCity, invoice.customerPostalCode),
        customerCountry: invoice.customerCountry ?? '',
        invoiceDate: dateTimeFromInvoiceValue(invoice.issueDate),
        serviceDate: dateFromInvoiceValue(invoice.serviceDate),
        dueDate: dateFromInvoiceValue(invoice.dueDate),
        paymentDate: dateFromInvoiceValue(invoice.paymentDate),
        paidAmount: invoice.paidAmount == null ? '' : String(invoice.paidAmount),
        purchaseOrderNumber: invoice.purchaseOrderNumber ?? '',
        deliveryNoteNumber: invoice.deliveryNoteNumber ?? '',
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
    const [creditedAmount, setCreditedAmount] = useState(0)
    const [taxConfirmation, setTaxConfirmation] = useState<InvoiceTaxConfirmation | null>(null)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [reloadVersion, setReloadVersion] = useState(0)
    const [requestErrors, setRequestErrors] = useState<InvoiceRequestErrors>({})
    const replaceLoadedDraft = useEffectEvent(replaceDraft)
    const markLoadedDraftClean = useEffectEvent(markClean)
    const clearLoadedDraft = useEffectEvent(clearCleanDraft)
    const finishNavigation = useEffectEvent(disallowNavigation)
    const requestKey = `${routeInvoiceNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState({
        requestKey: '__initial__',
        error: null as string | null,
    })
    const [warningResult, setWarningResult] = useState({
        requestKey: '__initial__',
        warnings: [] as string[],
        storedTotal: null as number | null,
    })
    const isLoading = Boolean(routeInvoiceNumber) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null
    const warnings = warningResult.requestKey === requestKey ? warningResult.warnings : []
    const storedTotal = warningResult.requestKey === requestKey ? warningResult.storedTotal : null

    useEffect(() => {
        if (!routeInvoiceNumber) return
        const controller = new AbortController()
        void fetchInvoice(routeInvoiceNumber, controller.signal).then((invoice) => {
            const nextDraft = draftFromInvoice(invoice)
            const headerTotal = currencyCents(invoice.amount ?? 0)
            const lineTotal = sumCurrencyCents((invoice.items ?? []).map((item) => item.grossAmount))
            const hasInconsistentLine = (invoice.items ?? []).some((item) => {
                const netTotal = currencyCents(item.netAmount ?? 0)
                const vatTotal = currencyCents((item.netAmount ?? 0) * (item.taxRate ?? 0) / 100)
                return currencyCents(item.grossAmount ?? 0) !== netTotal + vatTotal
            })
            setInvoiceId(invoice.id ?? null)
            setCreditedAmount(invoice.creditedAmount ?? 0)
            setTaxConfirmation(invoice.zoi && invoice.eor ? { zoi: invoice.zoi, eor: invoice.eor } : null)
            replaceLoadedDraft(nextDraft)
            markLoadedDraftClean(nextDraft)
            finishNavigation()
            setLoadResult({ requestKey, error: null })
            setWarningResult({
                requestKey,
                warnings: [
                    ...(headerTotal === lineTotal ? [] : ['invoice-total']),
                    ...(hasInconsistentLine ? ['invoice-line-total'] : []),
                ],
                storedTotal: headerTotal === lineTotal ? null : (invoice.amount ?? 0),
            })
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
            setWarningResult({ requestKey, warnings: [], storedTotal: null })
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
            purchaseOrderNumber: '', deliveryNoteNumber: '',
            introductoryText: '', closingText: '', invoiceItems: [],
        }
        setInvoiceId(null)
        setCreditedAmount(0)
        setTaxConfirmation(null)
        replaceLoadedDraft(initialDraft)
        clearLoadedDraft()
        setRequestErrors((current) => ({
            ...current, nextInvoiceNumber: undefined, invoiceTextTemplate: undefined,
        }))
        const controller = new AbortController()
        const templatePromise = fetchTextTemplate(
            TextTemplateDocumentType.Invoice,
            controller.signal,
        ).catch((requestError: unknown) => {
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
                const deliveryNote = takeDeliveryNoteForInvoice()
                const priceQuote = deliveryNote ? null : takePriceQuoteForInvoice()
                const source = deliveryNote ?? priceQuote
                const convertedDraft: InvoiceDraft = source ? {
                    ...nextDraft,
                    customerId: source.customerId,
                    customerName: source.customerName,
                    customerAddress: source.customerAddress,
                    customerPostalCode: source.customerPostalCode,
                    customerCity: source.customerCity,
                    customerCountry: source.customerCountry,
                    deliveryNoteNumber: deliveryNote?.deliveryNoteNumber ?? '',
                    introductoryText: [
                        nextDraft.introductoryText, source.introductoryText,
                    ].filter(Boolean).join('\n'),
                    closingText: nextDraft.closingText || source.closingText,
                    invoiceItems: source.items.map((item, index) => ({
                        ...item, id: -index - 1,
                    })),
                } : nextDraft
                setRequestErrors((current) => ({ ...current, nextInvoiceNumber: undefined }))
                replaceLoadedDraft(convertedDraft)
                markLoadedDraftClean(nextDraft)
                if (priceQuote) toast.add({
                    title: 'Price quote converted',
                    description: 'The invoice draft has been populated. Review and save it when ready.',
                    type: 'success',
                })
                if (deliveryNote) toast.add({
                    title: 'Delivery note converted',
                    description: 'The invoice draft has been populated. Review and save it when ready.',
                    type: 'success',
                })
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
        invoiceId, setInvoiceId, creditedAmount, taxConfirmation, setTaxConfirmation,
        businessYear, setBusinessYear, isLoading, error, warnings,
        storedTotal,
        requestErrors, setRequestErrors, reload,
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => { preserveDuplicateRef.current = true },
    }
}
