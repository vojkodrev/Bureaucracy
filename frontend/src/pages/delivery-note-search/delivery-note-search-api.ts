import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import { nextPaddedNumber } from '@/lib/numbers'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type {
    DeliveryNote,
    DeliveryNotePage,
    DeliveryNoteSearchCriteria,
} from './types'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

const searchQuery = `
    query SearchDeliveryNotes(
        $businessYear: String!
        $deliveryNoteNumber: String
        $customerId: String
        $customerName: String
        $productCode: String
        $productName: String
        $issuedFrom: Time
        $issuedTo: Time
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchDeliveryNotes(
            businessYear: $businessYear
            deliveryNoteNumber: $deliveryNoteNumber
            customerId: $customerId
            customerName: $customerName
            productCode: $productCode
            productName: $productName
            issuedFrom: $issuedFrom
            issuedTo: $issuedTo
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            deliveryNotes {
                id deliveryNoteNumber issueDate deliveryDate
                customerCode customerName currency amount withoutAmounts
            }
            totalCount page pageSize totalPages
        }
    }
`

const noteQuery = `
    query DeliveryNote(
        $businessYear: String!
        $deliveryNoteNumber: String!
    ) {
        deliveryNote(
            businessYear: $businessYear
            deliveryNoteNumber: $deliveryNoteNumber
        ) {
            id deliveryNoteNumber issueDate deliveryDate
            customerCode customerName customerAddress
            customerPostalCode customerCity customerCountry
            amount introductoryText closingText withoutAmounts
            items {
                id sequence productCode productName unit taxCode taxRate
                unitPrice unitTaxAmount quantity discount netAmount grossAmount
            }
        }
    }
`

const latestQuery = `
    query LatestDeliveryNote($businessYear: String!) {
        searchDeliveryNotes(
            businessYear: $businessYear
            sortBy: "deliveryNoteNumber"
            sortDirection: "desc"
            page: 1
            pageSize: 1
        ) {
            deliveryNotes { deliveryNoteNumber }
        }
    }
`

const saveMutation = `
    mutation SaveDeliveryNote(
        $businessYear: String!
        $deliveryNote: DeliveryNoteInput!
    ) {
        saveDeliveryNote(
            businessYear: $businessYear
            deliveryNote: $deliveryNote
        ) {
            id deliveryNoteNumber
        }
    }
`

const optional = (value: string) => value || null

export async function fetchDeliveryNotes(
    search: DeliveryNoteSearchCriteria,
    signal?: AbortSignal,
): Promise<DeliveryNotePage> {
    const result = await postGraphql<{
        data?: { searchDeliveryNotes: DeliveryNotePage }
    }>(searchQuery, {
        businessYear: getSelectedBusinessYear(),
        deliveryNoteNumber: optional(search.deliveryNoteNumber),
        customerId: optional(search.customerId),
        customerName: optional(search.customerName),
        productCode: optional(search.productCode),
        productName: optional(search.productName),
        issuedFrom: optional(search.from),
        issuedTo: optional(search.to),
        sortBy: optional(search.sortBy),
        sortDirection: optional(search.sortDirection),
        page: positiveInteger(search.page, defaultPage),
        pageSize: Math.min(
            positiveInteger(search.pageSize, defaultPageSize),
            maximumPageSize,
        ),
    }, signal)
    if (!result.data) {
        throw new Error('Delivery note search returned no data')
    }
    return result.data.searchDeliveryNotes
}

export async function fetchDeliveryNote(
    deliveryNoteNumber: string,
    signal?: AbortSignal,
): Promise<DeliveryNote> {
    const result = await postGraphql<{
        data?: { deliveryNote: DeliveryNote | null }
    }>(noteQuery, {
        businessYear: getSelectedBusinessYear(),
        deliveryNoteNumber,
    }, signal)
    if (!result.data?.deliveryNote) {
        throw new Error(`Delivery note ${deliveryNoteNumber} was not found`)
    }
    return result.data.deliveryNote
}

export async function fetchDeliveryNoteExists(
    deliveryNoteNumber: string,
): Promise<boolean> {
    const result = await postGraphql<{
        data?: { deliveryNote: Pick<DeliveryNote, 'id'> | null }
    }>(noteQuery, {
        businessYear: getSelectedBusinessYear(),
        deliveryNoteNumber,
    })
    return result.data?.deliveryNote != null
}

export async function fetchLatestDeliveryNoteNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
): Promise<string | undefined> {
    const result = await postGraphql<{
        data?: {
            searchDeliveryNotes: {
                deliveryNotes: { deliveryNoteNumber: string }[]
            }
        }
    }>(latestQuery, { businessYear }, signal)
    return result.data?.searchDeliveryNotes
        .deliveryNotes[0]?.deliveryNoteNumber
}

export async function fetchNextDeliveryNoteNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
): Promise<string> {
    const latest = await fetchLatestDeliveryNoteNumber(signal, businessYear)
    return nextPaddedNumber(latest, 5)
}

export async function saveDeliveryNote(
    deliveryNote: Record<string, unknown>,
) {
    return postGraphql<{
        data?: {
            saveDeliveryNote: {
                id: number
                deliveryNoteNumber: string
            }
        }
    }>(saveMutation, {
        businessYear: getSelectedBusinessYear(),
        deliveryNote,
    })
}

export function deliveryNotePdfUrl(number: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/delivery-notes/${encodeURIComponent(number)}/pdf`
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}
