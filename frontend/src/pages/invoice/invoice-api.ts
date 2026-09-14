import { getSelectedBusinessYear } from '@/lib/business-year'
import type { BusinessYearResponse } from '@/lib/business-year-types'
import type { InvoiceResponse, LatestInvoiceResponse } from '@/lib/invoice-types'
import { nextPaddedNumber } from '@/lib/numbers'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

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
        ) { invoices { invoiceNumber } }
    }
`

const invoiceTextTemplateQuery = `
    query InvoiceTextTemplate($businessYear: String!) {
        invoiceTextTemplate(businessYear: $businessYear) { introductoryText closingText }
    }
`

const businessYearQuery = `query BusinessYear($code: String!) { businessYear(code: $code) { year } }`
const currentBusinessYearQuery = `query CurrentBusinessYear { currentBusinessYear { code year } }`
const customerPaymentTermQuery = `
    query CustomerPaymentTerm($businessYear: String!, $customerId: String!) {
        customer(businessYear: $businessYear, customerId: $customerId) { paymentTerm }
    }
`

export const saveInvoiceMutation = `
    mutation SaveInvoice($businessYear: String!, $invoice: InvoiceInput!) {
        saveInvoice(businessYear: $businessYear, invoice: $invoice) { id invoiceNumber }
    }
`

type GraphqlErrors = { errors?: { message: string }[] }

async function postGraphql<T extends GraphqlErrors>(
    query: string,
    variables?: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal,
    })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const result = await response.json() as T
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result
}

export async function fetchInvoice(invoiceNumber: string, signal?: AbortSignal) {
    const result = await postGraphql<InvoiceResponse>(invoiceQuery, {
        businessYear: getSelectedBusinessYear(), invoiceNumber,
    }, signal)
    if (!result.data?.invoice) throw new Error(`Invoice ${invoiceNumber} was not found`)
    return result.data.invoice
}

export async function fetchLatestInvoiceNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
): Promise<string | undefined> {
    const result = await postGraphql<LatestInvoiceResponse>(latestInvoiceQuery, { businessYear }, signal)
    return result.data?.searchInvoices.invoices[0]?.invoiceNumber
}

export async function fetchNextInvoiceNumber(signal?: AbortSignal, businessYear = getSelectedBusinessYear()) {
    return nextPaddedNumber(await fetchLatestInvoiceNumber(signal, businessYear), 5)
}

export async function fetchInvoiceTextTemplate(signal?: AbortSignal) {
    const result = await postGraphql<{
        data?: { invoiceTextTemplate: { introductoryText: string | null; closingText: string | null } }
        errors?: { message: string }[]
    }>(invoiceTextTemplateQuery, { businessYear: getSelectedBusinessYear() }, signal)
    return result.data?.invoiceTextTemplate ?? { introductoryText: null, closingText: null }
}

export async function fetchBusinessYear(signal?: AbortSignal) {
    const result = await postGraphql<BusinessYearResponse>(businessYearQuery, {
        code: getSelectedBusinessYear(),
    }, signal)
    return result.data?.businessYear?.year ?? null
}

export async function fetchCurrentBusinessYear(): Promise<{ code: string; year: number }> {
    const result = await postGraphql<{
        data?: { currentBusinessYear: { code: string | null; year: number | null } | null }
        errors?: { message: string }[]
    }>(currentBusinessYearQuery)
    const current = result.data?.currentBusinessYear
    if (!current?.code || current.year == null) throw new Error('No current business year exists')
    return { code: current.code, year: current.year }
}

export async function fetchCustomerPaymentTerm(customerId: string, businessYear: string) {
    if (!customerId) return null
    const result = await postGraphql<{
        data?: { customer: { paymentTerm: number | null } | null }
        errors?: { message: string }[]
    }>(customerPaymentTermQuery, { businessYear, customerId })
    return result.data?.customer?.paymentTerm ?? null
}

export function invoicePdfUrl(invoiceNumber: string, businessYear: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/invoices/${encodeURIComponent(invoiceNumber)}/pdf`
    url.searchParams.set('businessYear', businessYear)
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

export async function postSaveInvoice(variables: Record<string, unknown>) {
    return postGraphql<{
        data?: { saveInvoice: { id: number; invoiceNumber: string } }
        errors?: { message: string }[]
    }>(saveInvoiceMutation, variables)
}
