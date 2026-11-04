import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import { nextPaddedNumber } from '@/lib/numbers'
import type { CreditNote } from './types'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

const fields = `
    id creditNoteNumber issueDate serviceDate dueDate customerCode customerName
    customerAddress customerPostalCode customerCity customerCountry currency amount goodsAmount
    introductoryText closingText
    items {
        id sequence productCode productName unit taxCode taxRate unitPrice unitTaxAmount
        quantity discount netAmount grossAmount originalInvoiceNumber
    }
`

const creditNoteQuery = `query CreditNote($businessYear: String!, $creditNoteNumber: String!) {
    creditNote(businessYear: $businessYear, creditNoteNumber: $creditNoteNumber) { ${fields} }
}`

const latestCreditNoteQuery = `query LatestCreditNote($businessYear: String!) {
    searchCreditNotes(
        businessYear: $businessYear,
        sortBy: "creditNoteNumber",
        sortDirection: "desc",
        page: 1,
        pageSize: 1
    ) {
        creditNotes { creditNoteNumber }
    }
}`

const saveMutation = `mutation SaveCreditNote(
    $businessYear: String!, $creditNote: CreditNoteInput!
) {
    saveCreditNote(businessYear: $businessYear, creditNote: $creditNote) {
        id creditNoteNumber
    }
}`

export async function fetchCreditNote(number: string, signal?: AbortSignal) {
    const result = await postGraphql<{
        data?: { creditNote: CreditNote | null }
    }>(creditNoteQuery, {
        businessYear: getSelectedBusinessYear(),
        creditNoteNumber: number,
    }, signal)
    if (!result.data?.creditNote) throw new Error(`Credit note ${number} was not found`)
    return result.data.creditNote
}

export async function fetchCreditNoteExists(number: string) {
    const result = await postGraphql<{
        data?: { creditNote: Pick<CreditNote, 'id'> | null }
    }>(creditNoteQuery, {
        businessYear: getSelectedBusinessYear(),
        creditNoteNumber: number,
    })
    return result.data?.creditNote != null
}

export async function fetchLatestCreditNoteNumber(
    signal?: AbortSignal,
): Promise<string | undefined> {
    const result = await postGraphql<{
        data?: {
            searchCreditNotes: {
                creditNotes: Pick<CreditNote, 'creditNoteNumber'>[]
            }
        }
    }>(latestCreditNoteQuery, {
        businessYear: getSelectedBusinessYear(),
    }, signal)
    return result.data?.searchCreditNotes.creditNotes[0]?.creditNoteNumber
}

export async function fetchNextCreditNoteNumber(signal?: AbortSignal) {
    return nextPaddedNumber(await fetchLatestCreditNoteNumber(signal), 5)
}

export async function saveCreditNote(creditNote: Record<string, unknown>) {
    return postGraphql<{
        data?: { saveCreditNote: { id: number; creditNoteNumber: string } }
    }>(saveMutation, {
        businessYear: getSelectedBusinessYear(),
        creditNote,
    })
}

export function creditNotePdfUrl(number: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/credit-notes/${encodeURIComponent(number)}/pdf`
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}
