import { getSelectedBusinessYear } from '@/lib/business-year'
import { postGraphql } from '@/lib/graphql'
import type { GoodsReceipt, Storage } from '@/lib/goods-receipt-types'
import { nextPaddedNumber } from '@/lib/numbers'

const fields = 'id receiptNumber receiptDate storage receivedBy items { id productCode productName unit quantity photos { fileId } }'
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function fileApiUrl(fileId?: string) {
    const url = new URL(graphqlUrl)
    url.pathname = fileId
        ? `/api/file/${encodeURIComponent(fileId)}`
        : '/api/file'
    url.search = ''
    return url.toString()
}

export function goodsReceiptPhotoUrl(fileId: string) {
    return fileApiUrl(fileId)
}

export async function uploadGoodsReceiptPhoto(file: File) {
    const body = new FormData()
    body.append('file', file)
    const response = await fetch(fileApiUrl(), { method: 'POST', body })
    const result = await response.json().catch(() => ({})) as { fileId?: string; error?: string }
    if (!response.ok || !result.fileId) throw new Error(result.error ?? `Photo upload failed (${response.status})`)
    return { fileId: result.fileId }
}


export async function fetchGoodsReceipt(receiptNumber: string, signal?: AbortSignal) {
    const result = await postGraphql<{ data?: { goodsReceipt: GoodsReceipt | null } }>(`
        query GoodsReceipt($businessYear: String!, $receiptNumber: String!) {
            goodsReceipt(businessYear: $businessYear, receiptNumber: $receiptNumber) { ${fields} }
        }`, { businessYear: getSelectedBusinessYear(), receiptNumber }, signal)
    if (!result.data?.goodsReceipt) throw new Error(`Goods receipt ${receiptNumber} was not found`)
    return result.data.goodsReceipt
}

export async function fetchGoodsReceiptExists(receiptNumber: string) {
    const result = await postGraphql<{
        data?: { goodsReceipt: Pick<GoodsReceipt, 'id'> | null }
    }>(`
        query GoodsReceiptExists(
            $businessYear: String!
            $receiptNumber: String!
        ) {
            goodsReceipt(
                businessYear: $businessYear
                receiptNumber: $receiptNumber
            ) { id }
        }
    `, {
        businessYear: getSelectedBusinessYear(),
        receiptNumber,
    })
    return result.data?.goodsReceipt != null
}

export async function fetchLatestGoodsReceiptNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
) {
    const result = await postGraphql<{
        data?: {
            searchGoodsReceipts: {
                goodsReceipts: Pick<GoodsReceipt, 'receiptNumber'>[]
            }
        }
    }>(`
        query LatestGoodsReceipt($businessYear: String!) {
            searchGoodsReceipts(
                businessYear: $businessYear
                sortBy: "receiptNumber"
                sortDirection: "desc"
                page: 1
                pageSize: 1
            ) {
                goodsReceipts { receiptNumber }
            }
        }
    `, { businessYear }, signal)
    return result.data?.searchGoodsReceipts.goodsReceipts[0]
        ?.receiptNumber ?? ''
}

export async function fetchNextGoodsReceiptNumber(
    signal?: AbortSignal,
    businessYear = getSelectedBusinessYear(),
) {
    const latest = await fetchLatestGoodsReceiptNumber(signal, businessYear)
    return nextPaddedNumber(latest, 5)
}

export async function fetchGoodsReceiptStorages(signal?: AbortSignal) {
    const result = await postGraphql<{ data?: { goodsReceiptStorages: Storage[] } }>(`
        query GoodsReceiptStorages($businessYear: String!) {
            goodsReceiptStorages(businessYear: $businessYear) { code }
        }
    `, { businessYear: getSelectedBusinessYear() }, signal)
    return result.data?.goodsReceiptStorages ?? []
}

export async function saveGoodsReceipt(goodsReceipt: Record<string, unknown>) {
    const result = await postGraphql<{ data?: { saveGoodsReceipt: GoodsReceipt } }>(`
        mutation SaveGoodsReceipt($businessYear: String!, $goodsReceipt: GoodsReceiptInput!) {
            saveGoodsReceipt(businessYear: $businessYear, goodsReceipt: $goodsReceipt) { ${fields} }
        }`, { businessYear: getSelectedBusinessYear(), goodsReceipt })
    if (!result.data?.saveGoodsReceipt) throw new Error('Saving goods receipt returned no receipt')
    return result.data.saveGoodsReceipt
}
