import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { getSelectedBusinessYear, setSelectedBusinessYear } from '@/lib/business-year'
import type { BusinessYearResponse } from '@/lib/business-year-types'
import { dateAfterDays, dateForApi, dateFromSearchValue } from '@/lib/dates'
import { emptyToNull } from '@/lib/form-input'
import type { InvoiceItem, InvoiceResponse, LatestInvoiceResponse } from '@/lib/invoice-types'
import { nextPaddedNumber, numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import CustomerInputFields from './CustomerInputFields'
import EmailInvoiceDialog from './EmailInvoiceDialog'
import GeneralInformationInput from './GeneralInformationInput'
import InvoiceNumberAlert from './InvoiceNumberAlert'
import type { InvoiceNumberWarning } from './InvoiceNumberAlert'
import InvoiceMenu from './InvoiceMenu'
import InvoiceSummary from './InvoiceSummary'
import Products from './Products'
import SaveCustomerEmailAlert from './SaveCustomerEmailAlert'
import UnsavedInvoiceAlerts from './UnsavedInvoiceAlerts'

type InvoiceLoadResult = { requestKey: string; error: string | null }
type InvoiceTextTemplate = { introductoryText: string | null; closingText: string | null }
type InvoiceTextTemplateResponse = {
    data?: { invoiceTextTemplate: InvoiceTextTemplate }
    errors?: { message: string }[]
}
type CustomerPaymentTermResponse = {
    data?: { customer: { paymentTerm: number | null } | null }
    errors?: { message: string }[]
}

type InvoiceDraft = {
    invoiceNumber: string
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    invoiceDate?: Date
    serviceDate?: Date
    dueDate?: Date
    paymentDate?: Date
    paidAmount: string
    introductoryText: string
    closingText: string
    invoiceItems: InvoiceItem[]
}

function serializeDraft(draft: InvoiceDraft): string {
    return JSON.stringify({
        ...draft,
        invoiceDate: draft.invoiceDate?.getTime() ?? null,
        serviceDate: draft.serviceDate?.getTime() ?? null,
        dueDate: draft.dueDate?.getTime() ?? null,
        paymentDate: draft.paymentDate?.getTime() ?? null,
    })
}

const invoiceQuery = `
    query Invoice($businessYear: String!, $invoiceNumber: String!) {
        invoice(businessYear: $businessYear, invoiceNumber: $invoiceNumber) {
            id invoiceNumber issueDate serviceDate dueDate paymentDate customerCode
            customerName customerAddress customerPostalCode customerCity customerCountry
            paidAmount introductoryText closingText
            items {
                id sequence productCode productName unit taxCode taxRate unitPrice
                unitTaxAmount quantity discount netAmount grossAmount
            }
        }
    }
`

const latestInvoiceQuery = `
    query LatestInvoice($businessYear: String!) {
        searchInvoices(
            businessYear: $businessYear
            sortBy: "invoiceNumber"
            sortDirection: "desc"
            page: 1
            pageSize: 1
        ) {
            invoices { invoiceNumber }
        }
    }
`
const invoiceTextTemplateQuery = `
    query InvoiceTextTemplate($businessYear: String!) {
        invoiceTextTemplate(businessYear: $businessYear) { introductoryText closingText }
    }
`

const businessYearQuery = `
    query BusinessYear($code: String!) {
        businessYear(code: $code) { year }
    }
`
const currentBusinessYearQuery = `
    query CurrentBusinessYear {
        currentBusinessYear { code year }
    }
`
const customerPaymentTermQuery = `
    query CustomerPaymentTerm($businessYear: String!, $customerId: String!) {
        customer(businessYear: $businessYear, customerId: $customerId) { paymentTerm }
    }
`
const saveInvoiceMutation = `
    mutation SaveInvoice($businessYear: String!, $invoice: InvoiceInput!) {
        saveInvoice(businessYear: $businessYear, invoice: $invoice) {
            id
            invoiceNumber
        }
    }
`
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

type SaveInvoiceResponse = {
    data?: { saveInvoice: { id: number; invoiceNumber: string } }
    errors?: { message: string }[]
}

async function fetchNextInvoiceNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
): Promise<string> {
    return nextPaddedNumber(await fetchLatestInvoiceNumber(signal, businessYear), 5)
}

async function fetchLatestInvoiceNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
): Promise<string | undefined> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: latestInvoiceQuery,
            variables: { businessYear },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Loading latest invoice failed (${response.status})`)

    const result = (await response.json()) as LatestInvoiceResponse
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result.data?.searchInvoices.invoices[0]?.invoiceNumber
}

async function fetchCurrentBusinessYear(): Promise<{ code: string; year: number }> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: currentBusinessYearQuery,
        }),
    })
    if (!response.ok) throw new Error(`Loading current business year failed (${response.status})`)

    const result = await response.json() as {
        data?: { currentBusinessYear: { code: string | null; year: number | null } | null }
        errors?: { message: string }[]
    }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    const currentBusinessYear = result.data?.currentBusinessYear
    if (!currentBusinessYear?.code || currentBusinessYear.year == null) {
        throw new Error('No current business year exists')
    }
    return { code: currentBusinessYear.code, year: currentBusinessYear.year }
}

async function fetchInvoiceTextTemplate(signal?: AbortSignal): Promise<InvoiceTextTemplate> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: invoiceTextTemplateQuery,
            variables: { businessYear: getSelectedBusinessYear() },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Loading invoice text template failed (${response.status})`)

    const result = await response.json() as InvoiceTextTemplateResponse
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result.data?.invoiceTextTemplate ?? { introductoryText: null, closingText: null }
}

async function fetchCustomerPaymentTerm(
    customerId: string,
    businessYear = getSelectedBusinessYear(),
): Promise<number | null> {
    if (!customerId) return null

    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: customerPaymentTermQuery,
            variables: { businessYear, customerId },
        }),
    })
    if (!response.ok) throw new Error(`Loading customer payment term failed (${response.status})`)

    const result = (await response.json()) as CustomerPaymentTermResponse
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result.data?.customer?.paymentTerm ?? null
}

function dateFromInvoiceValue(value: string | null | undefined): Date | undefined {
    return value ? dateFromSearchValue(value.slice(0, 10)) : undefined
}

function invoicePdfUrl(invoiceNumber: string, businessYear: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/invoices/${encodeURIComponent(invoiceNumber)}/pdf`
    url.searchParams.set('businessYear', businessYear)
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

function InvoicePage() {
    const { invoiceNumber: routeInvoiceNumber } = useParams()
    const navigate = useNavigate()
    const preserveDuplicateRef = useRef(false)
    const allowNextNavigationRef = useRef(false)
    const pendingRevertRef = useRef(false)
    const [invoiceId, setInvoiceId] = useState<number | null>(null)
    const [invoiceNumber, setInvoiceNumber] = useState(routeInvoiceNumber ?? '')
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const [customerId, setCustomerId] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [customerPostalCode, setCustomerPostalCode] = useState('')
    const [customerCity, setCustomerCity] = useState('')
    const [customerCountry, setCustomerCountry] = useState('')
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>()
    const [serviceDate, setServiceDate] = useState<Date | undefined>()
    const [dueDate, setDueDate] = useState<Date | undefined>()
    const [paymentDate, setPaymentDate] = useState<Date | undefined>()
    const [paidAmount, setPaidAmount] = useState('')
    const [introductoryText, setIntroductoryText] = useState('')
    const [closingText, setClosingText] = useState('')
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [reloadVersion, setReloadVersion] = useState(0)
    const [printError, setPrintError] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [cleanDraft, setCleanDraft] = useState<string | null>(null)
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)
    const [confirmingPrint, setConfirmingPrint] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const [customerEmailToSave, setCustomerEmailToSave] = useState<string | null>(null)
    const [invoiceNumberWarning, setInvoiceNumberWarning] =
        useState<InvoiceNumberWarning | null>(null)
    const requestKey = `${routeInvoiceNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState<InvoiceLoadResult>({ requestKey: '__initial__', error: null })
    const isLoading = Boolean(routeInvoiceNumber) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null
    const canSaveInvoice = Boolean(invoiceNumber.trim()) &&
        !isLoading &&
        !error &&
        (!routeInvoiceNumber || invoiceId != null || invoiceNumber !== routeInvoiceNumber)
    const draft = serializeDraft({
        invoiceNumber, customerId, customerName, customerAddress, customerPostalCode,
        customerCity, customerCountry, invoiceDate, serviceDate, dueDate, paymentDate, paidAmount,
        introductoryText, closingText, invoiceItems,
    })
    const hasUnsavedChanges = cleanDraft !== null && draft !== cleanDraft
    const canPrintInvoice = invoiceId != null &&
        Boolean(invoiceNumber.trim()) &&
        !hasUnsavedChanges &&
        !isLoading &&
        !error &&
        !isSaving &&
        !isDuplicating
    const canRequestPrintInvoice = Boolean(invoiceNumber.trim()) &&
        !isLoading &&
        !error &&
        !isSaving &&
        !isDuplicating
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNextNavigationRef.current &&
        hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search ||
            currentLocation.hash !== nextLocation.hash),
    )

    useEffect(() => {
        if (!routeInvoiceNumber) return
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: invoiceQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    invoiceNumber: routeInvoiceNumber,
                },
            }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading invoice failed (${response.status})`)
            const result = (await response.json()) as InvoiceResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.invoice) throw new Error(`Invoice ${routeInvoiceNumber} was not found`)
            const invoice = result.data.invoice
            setInvoiceId(invoice.id ?? null)
            setInvoiceNumber(invoice.invoiceNumber)
            setCustomerId(invoice.customerCode ?? '')
            setCustomerName(invoice.customerName ?? '')
            setCustomerAddress(invoice.customerAddress ?? '')
            setCustomerPostalCode(invoice.customerPostalCode ?? '')
            setCustomerCity(invoice.customerCity ?? '')
            setCustomerCountry(invoice.customerCountry ?? '')
            setInvoiceDate(dateFromInvoiceValue(invoice.issueDate))
            setServiceDate(dateFromInvoiceValue(invoice.serviceDate))
            setDueDate(dateFromInvoiceValue(invoice.dueDate))
            setPaymentDate(dateFromInvoiceValue(invoice.paymentDate))
            setPaidAmount(invoice.paidAmount == null ? '' : String(invoice.paidAmount))
            setIntroductoryText(invoice.introductoryText ?? '')
            setClosingText(invoice.closingText ?? '')
            setInvoiceItems(invoice.items ?? [])
            setCleanDraft(serializeDraft({
                invoiceNumber: invoice.invoiceNumber,
                customerId: invoice.customerCode ?? '',
                customerName: invoice.customerName ?? '',
                customerAddress: invoice.customerAddress ?? '',
                customerPostalCode: invoice.customerPostalCode ?? '',
                customerCity: invoice.customerCity ?? '',
                customerCountry: invoice.customerCountry ?? '',
                invoiceDate: dateFromInvoiceValue(invoice.issueDate),
                serviceDate: dateFromInvoiceValue(invoice.serviceDate),
                dueDate: dateFromInvoiceValue(invoice.dueDate),
                paymentDate: dateFromInvoiceValue(invoice.paymentDate),
                paidAmount: invoice.paidAmount == null ? '' : String(invoice.paidAmount),
                introductoryText: invoice.introductoryText ?? '',
                closingText: invoice.closingText ?? '',
                invoiceItems: invoice.items ?? [],
            }))
            allowNextNavigationRef.current = false
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
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            pendingRevertRef.current = false
            setLoadResult({
                requestKey,
                error: requestError instanceof Error
                    ? requestError.message
                    : 'Loading invoice failed',
            })
        })
        return () => abortController.abort()
    }, [requestKey, routeInvoiceNumber])

    useEffect(() => {
        if (routeInvoiceNumber) return
        if (preserveDuplicateRef.current) {
            preserveDuplicateRef.current = false
            allowNextNavigationRef.current = false
            return
        }

        allowNextNavigationRef.current = false
        const today = new Date()

        setInvoiceId(null)
        setInvoiceNumber('')
        setCustomerId('')
        setCustomerName('')
        setCustomerAddress('')
        setCustomerPostalCode('')
        setCustomerCity('')
        setCustomerCountry('')
        setInvoiceDate(today)
        setServiceDate(undefined)
        setDueDate(undefined)
        setPaymentDate(undefined)
        setPaidAmount('')
        setIntroductoryText('')
        setClosingText('')
        setInvoiceItems([])
        setCleanDraft(null)
        setSaveError(null)
        setPrintError(null)

        const abortController = new AbortController()
        const templatePromise = fetchInvoiceTextTemplate(abortController.signal).catch((requestError: unknown) => {
            if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                console.error(requestError)
            }
            return { introductoryText: null, closingText: null }
        })
        void Promise.all([
            fetchNextInvoiceNumber(abortController.signal),
            templatePromise,
        ]).then(([nextInvoiceNumber, template]) => {
            const templateIntroductoryText = template.introductoryText ?? ''
            const templateClosingText = template.closingText ?? ''
            setInvoiceNumber(nextInvoiceNumber)
            setIntroductoryText(templateIntroductoryText)
            setClosingText(templateClosingText)
            setCleanDraft(serializeDraft({
                invoiceNumber: nextInvoiceNumber,
                customerId: '', customerName: '', customerAddress: '', customerPostalCode: '',
                customerCity: '', customerCountry: '', invoiceDate: today, serviceDate: undefined,
                dueDate: undefined, paymentDate: undefined, paidAmount: '',
                introductoryText: templateIntroductoryText,
                closingText: templateClosingText,
                invoiceItems: [],
            }))
        }).catch((requestError: unknown) => {
            if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                console.error(requestError)
            }
        })
        return () => abortController.abort()
    }, [routeInvoiceNumber])

    useEffect(() => {
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: businessYearQuery, variables: { code: getSelectedBusinessYear() } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading business year failed (${response.status})`)
            const result = (await response.json()) as BusinessYearResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            setBusinessYear(result.data?.businessYear?.year ?? null)
        }).catch((requestError: unknown) => {
            if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                console.error(requestError)
            }
        })
        return () => abortController.abort()
    }, [])

    const printInvoice = () => {
        if (!canPrintInvoice) {
            if (canSaveInvoice) setConfirmingPrint(true)
            return
        }
        const numberToPrint = invoiceNumber.trim()
        const pdfTab = window.open(invoicePdfUrl(numberToPrint, getSelectedBusinessYear()), '_blank')
        if (!pdfTab) { setPrintError('Allow pop-ups to open the invoice PDF.'); return }
        pdfTab.opener = null
        setPrintError(null)
    }

    const requestSaveInvoice = async () => {
        if (!canSaveInvoice || isSaving) return
        setIsSaving(true)
        setSaveError(null)
        try {
            const latestInvoiceNumber = await fetchLatestInvoiceNumber()
            const numberToSave = invoiceNumber.trim()
            const canSaveWithoutConfirmation =
                numberToSave === latestInvoiceNumber ||
                numberToSave === nextPaddedNumber(latestInvoiceNumber, 5)
            if (!canSaveWithoutConfirmation) {
                const numberValue = Number.parseInt(numberToSave, 10)
                const nextNumberValue = Number.parseInt(
                    nextPaddedNumber(latestInvoiceNumber, 5),
                    10,
                )
                setInvoiceNumberWarning({
                    kind:
                        numberValue > nextNumberValue
                            ? 'skipped'
                            : 'historical',
                    latestInvoiceNumber,
                })
                return
            }
            await performSaveInvoice()
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Checking latest invoice failed')
        } finally {
            setIsSaving(false)
        }
    }

    const saveBeforePrint = () => {
        setConfirmingPrint(false)
        void requestSaveInvoice()
    }

    const performSaveInvoice = async () => {
        const isCreating = invoiceId == null
        try {
            const response = await fetch(graphqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: saveInvoiceMutation,
                    variables: {
                        businessYear: getSelectedBusinessYear(),
                        invoice: {
                            id: invoiceId,
                            invoiceNumber: invoiceNumber.trim(),
                            issueDate: dateForApi(invoiceDate),
                            serviceDate: dateForApi(serviceDate),
                            dueDate: dateForApi(dueDate),
                            paymentDate: dateForApi(paymentDate),
                            customerCode: emptyToNull(customerId),
                            customerName: emptyToNull(customerName),
                            customerAddress: emptyToNull(customerAddress),
                            customerCity: emptyToNull(customerCity),
                            paidAmount: numberOrNull(paidAmount),
                            introductoryText: emptyToNull(introductoryText),
                            closingText: emptyToNull(closingText),
                            items: invoiceItems.map((item, index) => ({
                                id: item.id > 0 ? item.id : null,
                                sequence: index + 1,
                                productCode: item.productCode?.trim() ?? '',
                                taxCode: item.taxCode?.trim() ?? '',
                                quantity: item.quantity,
                                discount: item.discount,
                                netAmount: item.netAmount,
                                grossAmount: item.grossAmount,
                            })),
                        },
                    },
                }),
            })
            if (!response.ok) throw new Error(`Saving invoice failed (${response.status})`)
            const result = (await response.json()) as SaveInvoiceResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            const savedInvoice = result.data?.saveInvoice
            if (!savedInvoice) throw new Error('Saving invoice returned no invoice')
            toast.add({
                title: 'Invoice saved',
                description: `Invoice ${savedInvoice.invoiceNumber} was ${
                    isCreating ? 'created' : 'updated'
                } successfully.`,
                type: 'success',
            })
            setCleanDraft(draft)
            if (routeInvoiceNumber === savedInvoice.invoiceNumber) {
                setReloadVersion((version) => version + 1)
            } else {
                allowNextNavigationRef.current = true
                navigate(`/invoice/${encodeURIComponent(savedInvoice.invoiceNumber)}`)
            }
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Saving invoice failed')
        }
    }

    const saveConfirmedInvoice = async () => {
        if (!canSaveInvoice || isSaving) return
        setInvoiceNumberWarning(null)
        setIsSaving(true)
        setSaveError(null)
        try {
            await performSaveInvoice()
        } finally {
            setIsSaving(false)
        }
    }

    const duplicateInvoice = async () => {
        if (invoiceId == null || isDuplicating) return

        if (hasUnsavedChanges) {
            setConfirmingDuplicate(true)
            return
        }

        await performDuplicateInvoice()
    }

    const performDuplicateInvoice = async () => {
        if (invoiceId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        setSaveError(null)
        try {
            const currentBusinessYear = await fetchCurrentBusinessYear()
            const duplicateBusinessYearCode = currentBusinessYear.code
            const [nextInvoiceNumber, paymentTerm] = await Promise.all([
                fetchNextInvoiceNumber(undefined, duplicateBusinessYearCode),
                fetchCustomerPaymentTerm(customerId, duplicateBusinessYearCode),
            ])
            const duplicateInvoiceDate = new Date()
            if (
                businessYear !== currentBusinessYear.year ||
                duplicateBusinessYearCode !== getSelectedBusinessYear()
            ) {
                setSelectedBusinessYear(duplicateBusinessYearCode)
                setBusinessYear(currentBusinessYear.year)
            }
            setInvoiceId(null)
            setInvoiceNumber(nextInvoiceNumber)
            setInvoiceDate(duplicateInvoiceDate)
            setDueDate(dateAfterDays(duplicateInvoiceDate, paymentTerm))
            setPaymentDate(undefined)
            setPaidAmount('')
            setInvoiceItems((items) => items.map((item, index) => ({
                ...item,
                id: -index - 1,
            })))
            setCleanDraft('__unsaved_duplicate__')
            preserveDuplicateRef.current = true
            allowNextNavigationRef.current = true
            navigate('/invoice')
            toast.add({
                title: 'Invoice duplicated',
                description: `Invoice number ${nextInvoiceNumber} has been assigned to the ` +
                    'new unsaved copy. You can review and edit it before saving.',
                type: 'info',
            })
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Duplicating invoice failed')
        } finally {
            setIsDuplicating(false)
        }
    }

    const revertInvoice = () => {
        if (!routeInvoiceNumber || isLoading || isSaving || isDuplicating) return

        if (hasUnsavedChanges) {
            setConfirmingRevert(true)
            return
        }

        performRevert()
    }

    const performRevert = () => {
        setConfirmingRevert(false)

        setSaveError(null)
        setPrintError(null)
        pendingRevertRef.current = true
        setReloadVersion((version) => version + 1)
    }

    const onSaveShortcut = useEffectEvent(() => {
        void requestSaveInvoice()
    })
    const onPrintShortcut = useEffectEvent(printInvoice)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey)) return

            const key = event.key.toLowerCase()
            if (key !== 's' && key !== 'p') return

            event.preventDefault()
            if (key === 's') onSaveShortcut()
            if (key === 'p') onPrintShortcut()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    const totalIncludingVat = invoiceItems.reduce((total, item) => total + (item.grossAmount ?? 0), 0)
    return (
        <div className="max-w-5xl p-4">
            <InvoiceMenu
                canSave={canSaveInvoice}
                canPrint={canRequestPrintInvoice}
                canEmail={canPrintInvoice}
                canRevert={Boolean(routeInvoiceNumber) && !isLoading && !isSaving && !isDuplicating}
                canDuplicate={invoiceId != null && !isLoading && !isSaving}
                isSaving={isSaving}
                isDuplicating={isDuplicating}
                onSave={() => void requestSaveInvoice()}
                onPrint={printInvoice}
                onEmail={() => setEmailDialogOpen(true)}
                onRevert={revertInvoice}
                onDuplicate={() => void duplicateInvoice()}
            />
            <EmailInvoiceDialog
                open={emailDialogOpen}
                invoiceNumber={invoiceNumber.trim()}
                customerId={customerId}
                businessYear={businessYear}
                onOpenChange={setEmailDialogOpen}
                onOfferSaveCustomerEmail={setCustomerEmailToSave}
            />
            <SaveCustomerEmailAlert
                email={customerEmailToSave}
                customerId={customerId}
                customerName={customerName}
                onOpenChange={(open) => {
                    if (!open) setCustomerEmailToSave(null)
                }}
            />
            <InvoiceNumberAlert
                invoiceNumber={invoiceNumber.trim()}
                warning={invoiceNumberWarning}
                onOpenChange={(open) => {
                    if (!open) setInvoiceNumberWarning(null)
                }}
                onConfirm={() => void saveConfirmedInvoice()}
            />
            <UnsavedInvoiceAlerts
                isNavigationBlocked={blocker.state === 'blocked'}
                isConfirmingRevert={confirmingRevert}
                isConfirmingDuplicate={confirmingDuplicate}
                isConfirmingPrint={confirmingPrint}
                onCancelNavigation={() => {
                    if (blocker.state === 'blocked') blocker.reset()
                }}
                onDiscardAndNavigate={() => {
                    if (blocker.state !== 'blocked') return
                    allowNextNavigationRef.current = true
                    setCleanDraft(draft)
                    blocker.proceed()
                }}
                onConfirmingRevertChange={setConfirmingRevert}
                onDiscardAndRevert={performRevert}
                onConfirmingDuplicateChange={setConfirmingDuplicate}
                onDuplicateAnyway={() => void performDuplicateInvoice()}
                onConfirmingPrintChange={setConfirmingPrint}
                onSaveBeforePrint={saveBeforePrint}
            />
            {printError && <p className="mb-6 text-sm text-destructive" role="alert">{printError}</p>}
            {saveError && <p className="mb-6 text-sm text-destructive" role="alert">{saveError}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <CustomerInputFields
                    customerId={customerId}
                    customerName={customerName}
                    customerAddress={customerAddress}
                    customerPostalCode={customerPostalCode}
                    customerCity={customerCity}
                    customerCountry={customerCountry}
                    onCustomerIdChange={setCustomerId}
                    onCustomerNameChange={setCustomerName}
                    onCustomerAddressChange={setCustomerAddress}
                    onCustomerPostalCodeChange={setCustomerPostalCode}
                    onCustomerCityChange={setCustomerCity}
                    onCustomerCountryChange={setCustomerCountry}
                    onCustomerPaymentTermChange={(paymentTerm) =>
                        setDueDate(dateAfterDays(invoiceDate, paymentTerm))}
                />
                <GeneralInformationInput
                    invoiceNumber={invoiceNumber}
                    businessYear={businessYear}
                    invoiceDate={invoiceDate}
                    dueDate={dueDate}
                    serviceDate={serviceDate}
                    onInvoiceNumberChange={setInvoiceNumber}
                    onInvoiceDateChange={setInvoiceDate}
                    onDueDateChange={setDueDate}
                    onServiceDateChange={setServiceDate}
                />
            </div>
            <div className="mt-8 space-y-6">
                <Field>
                    <FieldLabel htmlFor="introductory-text">Introductory text</FieldLabel>
                    <Textarea
                        id="introductory-text"
                        name="introductoryText"
                        value={introductoryText}
                        onChange={(event) => setIntroductoryText(event.target.value)}
                    />
                </Field>
                <Products items={invoiceItems} isLoading={isLoading} error={error} onItemsChange={setInvoiceItems} />
                <Field>
                    <FieldLabel htmlFor="closing-text">Closing text</FieldLabel>
                    <Textarea
                        id="closing-text"
                        name="closingText"
                        value={closingText}
                        onChange={(event) => setClosingText(event.target.value)}
                    />
                </Field>
                <InvoiceSummary total={totalIncludingVat} paidAmount={paidAmount} paymentDate={paymentDate} />
            </div>
        </div>
    )
}

export default InvoicePage
