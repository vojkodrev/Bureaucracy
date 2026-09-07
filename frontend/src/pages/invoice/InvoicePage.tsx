import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { getSelectedBusinessYear } from '@/lib/business-year'
import type { BusinessYearResponse } from '@/lib/business-year-types'
import { dateFromSearchValue } from '@/lib/dates'
import type { InvoiceItem, InvoiceResponse, LatestInvoiceResponse } from '@/lib/invoice-types'
import CustomerInputFields from './CustomerInputFields'
import GeneralInformationInput from './GeneralInformationInput'
import InvoiceMenu from './InvoiceMenu'
import InvoiceSummary from './InvoiceSummary'
import Products from './Products'

type InvoiceLoadResult = { requestKey: string; error: string | null }

const invoiceQuery = `
    query Invoice($businessYear: String!, $invoiceNumber: String!) {
        invoice(businessYear: $businessYear, invoiceNumber: $invoiceNumber) {
            id invoiceNumber issueDate serviceDate paymentDate customerCode
            customerName customerAddress customerPostalCode customerCity customerCountry
            paidAmount introductoryText closingText
            items { id sequence productCode productName unit taxRate unitPrice unitTaxAmount quantity discount netAmount grossAmount }
        }
    }
`

const latestInvoiceQuery = `
    query LatestInvoice($businessYear: String!) {
        searchInvoices(businessYear: $businessYear, sortBy: "invoiceNumber", sortDirection: "desc", page: 1, pageSize: 1) {
            invoices { invoiceNumber }
        }
    }
`

const businessYearQuery = `query BusinessYear($code: String!) { businessYear(code: $code) { description } }`
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function invoiceNumberAfter(invoiceNumber?: string): string {
    const value = Number.parseInt(invoiceNumber ?? '', 10)
    return String(Number.isNaN(value) ? 1 : value + 1).padStart(5, '0')
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
    const [invoiceNumber, setInvoiceNumber] = useState(routeInvoiceNumber ?? '')
    const [businessYearDescription, setBusinessYearDescription] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [customerPostalCode, setCustomerPostalCode] = useState('')
    const [customerCity, setCustomerCity] = useState('')
    const [customerCountry, setCustomerCountry] = useState('')
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>()
    const [serviceDate, setServiceDate] = useState<Date | undefined>()
    const [paymentDate, setPaymentDate] = useState<Date | undefined>()
    const [paidAmount, setPaidAmount] = useState('')
    const [introductoryText, setIntroductoryText] = useState('')
    const [closingText, setClosingText] = useState('')
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [reloadVersion, setReloadVersion] = useState(0)
    const [printError, setPrintError] = useState<string | null>(null)
    const requestKey = `${routeInvoiceNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState<InvoiceLoadResult>({ requestKey: '__initial__', error: null })
    const isLoading = Boolean(routeInvoiceNumber) && loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey ? loadResult.error : null

    useEffect(() => {
        if (!routeInvoiceNumber) return
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: invoiceQuery, variables: { businessYear: getSelectedBusinessYear(), invoiceNumber: routeInvoiceNumber } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading invoice failed (${response.status})`)
            const result = (await response.json()) as InvoiceResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.invoice) throw new Error(`Invoice ${routeInvoiceNumber} was not found`)
            const invoice = result.data.invoice
            setInvoiceNumber(invoice.invoiceNumber)
            setCustomerId(invoice.customerCode ?? '')
            setCustomerName(invoice.customerName ?? '')
            setCustomerAddress(invoice.customerAddress ?? '')
            setCustomerPostalCode(invoice.customerPostalCode ?? '')
            setCustomerCity(invoice.customerCity ?? '')
            setCustomerCountry(invoice.customerCountry ?? '')
            setInvoiceDate(dateFromInvoiceValue(invoice.issueDate))
            setServiceDate(dateFromInvoiceValue(invoice.serviceDate))
            setPaymentDate(dateFromInvoiceValue(invoice.paymentDate))
            setPaidAmount(invoice.paidAmount == null ? '' : String(invoice.paidAmount))
            setIntroductoryText(invoice.introductoryText ?? '')
            setClosingText(invoice.closingText ?? '')
            setInvoiceItems(invoice.items ?? [])
            setLoadResult({ requestKey, error: null })
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setLoadResult({ requestKey, error: requestError instanceof Error ? requestError.message : 'Loading invoice failed' })
        })
        return () => abortController.abort()
    }, [requestKey, routeInvoiceNumber])

    useEffect(() => {
        if (routeInvoiceNumber) return
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: latestInvoiceQuery, variables: { businessYear: getSelectedBusinessYear() } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading latest invoice failed (${response.status})`)
            const result = (await response.json()) as LatestInvoiceResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            setInvoiceNumber(invoiceNumberAfter(result.data?.searchInvoices.invoices[0]?.invoiceNumber))
        }).catch((requestError: unknown) => {
            if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) console.error(requestError)
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
            setBusinessYearDescription(result.data?.businessYear?.description ?? '')
        }).catch((requestError: unknown) => {
            if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) console.error(requestError)
        })
        return () => abortController.abort()
    }, [])

    const printInvoice = () => {
        const numberToPrint = invoiceNumber.trim()
        if (!numberToPrint) return
        const pdfTab = window.open(invoicePdfUrl(numberToPrint, getSelectedBusinessYear()), '_blank')
        if (!pdfTab) { setPrintError('Allow pop-ups to open the invoice PDF.'); return }
        pdfTab.opener = null
        setPrintError(null)
    }

    const totalIncludingVat = invoiceItems.reduce((total, item) => total + (item.grossAmount ?? 0), 0)
    return (
        <div className="max-w-5xl p-4">
            <InvoiceMenu canPrint={Boolean(invoiceNumber.trim())} canRevert={Boolean(routeInvoiceNumber) && !isLoading} onPrint={printInvoice} onRevert={() => setReloadVersion((version) => version + 1)} />
            {printError && <p className="mb-6 text-sm text-destructive" role="alert">{printError}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <CustomerInputFields customerId={customerId} customerName={customerName} customerAddress={customerAddress} customerPostalCode={customerPostalCode} customerCity={customerCity} customerCountry={customerCountry} onCustomerIdChange={setCustomerId} onCustomerNameChange={setCustomerName} onCustomerAddressChange={setCustomerAddress} onCustomerPostalCodeChange={setCustomerPostalCode} onCustomerCityChange={setCustomerCity} onCustomerCountryChange={setCustomerCountry} />
                <GeneralInformationInput invoiceNumber={invoiceNumber} businessYearDescription={businessYearDescription} invoiceDate={invoiceDate} paymentDate={paymentDate} serviceDate={serviceDate} onInvoiceNumberChange={setInvoiceNumber} onInvoiceDateChange={setInvoiceDate} onPaymentDateChange={setPaymentDate} onServiceDateChange={setServiceDate} />
            </div>
            <div className="mt-8 space-y-6">
                <Field><FieldLabel htmlFor="introductory-text">Introductory text</FieldLabel><Textarea id="introductory-text" name="introductoryText" value={introductoryText} onChange={(event) => setIntroductoryText(event.target.value)} /></Field>
                <Products items={invoiceItems} isLoading={isLoading} error={error} onItemsChange={setInvoiceItems} />
                <Field><FieldLabel htmlFor="closing-text">Closing text</FieldLabel><Textarea id="closing-text" name="closingText" value={closingText} onChange={(event) => setClosingText(event.target.value)} /></Field>
                <InvoiceSummary total={totalIncludingVat} paidAmount={paidAmount} onPaidAmountChange={setPaidAmount} />
            </div>
        </div>
    )
}

export default InvoicePage
