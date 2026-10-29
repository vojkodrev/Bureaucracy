import type { BankStatementEntry } from '@/lib/bank-statement-types'

export function normalizeInvoiceNumber(value: string) {
    return value.trim().toUpperCase()
}

export function duplicateInvoiceNumbers(entries: BankStatementEntry[]) {
    const counts = new Map<string, number>()

    for (const entry of entries) {
        const documentNumber = entry.documentNumber?.trim()
        if (!documentNumber) continue

        const normalized = normalizeInvoiceNumber(documentNumber)
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    }

    return new Set(
        [...counts.entries()]
            .filter(([, count]) => count > 1)
            .map(([documentNumber]) => documentNumber),
    )
}

export function hasPaymentDateMismatch(
    transactionDate: string | null,
    invoicePaymentDate: string | null,
) {
    return transactionDate == null
        || invoicePaymentDate == null
        || transactionDate.slice(0, 10) !== invoicePaymentDate.slice(0, 10)
}

export function hasPaidAmountMismatch(
    invoiceAmount: number | null,
    invoicePaidAmount: number | null,
    transactionInflow: number | null,
) {
    return invoiceAmount == null
        || invoicePaidAmount == null
        || transactionInflow == null
        || Math.round(invoiceAmount * 100) !== Math.round(invoicePaidAmount * 100)
        || Math.round(invoicePaidAmount * 100) !== Math.round(transactionInflow * 100)
}
