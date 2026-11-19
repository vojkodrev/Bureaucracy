import type { GoodsReceiptItem } from '@/lib/goods-receipt-types'

const storageKey = 'deliveryNoteToGoodsReceipt'

type GoodsReceiptHandoff = {
    receiptNumber: string | null
    receiptDate: string | null
    items: GoodsReceiptItem[]
}

export function storeGoodsReceiptHandoff(handoff: GoodsReceiptHandoff) {
    sessionStorage.setItem(storageKey, JSON.stringify(handoff))
}

export function readGoodsReceiptHandoff(receiptNumber?: string) {
    try {
        const value = sessionStorage.getItem(storageKey)
        const handoff = value ? JSON.parse(value) as GoodsReceiptHandoff : null
        return handoff?.receiptNumber === (receiptNumber ?? null) ? handoff : null
    } catch {
        return null
    }
}

export function clearGoodsReceiptHandoff() {
    sessionStorage.removeItem(storageKey)
}
