import type { BankStatementEntry } from '@/lib/bank-statement-types'
import { currencyCents } from '@/lib/numbers'

const PARTIAL_CUSTOMER_INVOICE_PAYMENT_TYPE = 'Plačilo računa kupca - delni'

export function isPartialCustomerInvoicePayment(entry: BankStatementEntry) {
    return entry.transactionType?.trim() === PARTIAL_CUSTOMER_INVOICE_PAYMENT_TYPE
}

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
    creditedAmount: number,
    invoicePaidAmount: number | null,
    transactionInflow: number | null = invoicePaidAmount,
) {
    const amountAfterCredits = Math.max(0, currencyCents(
        (invoiceAmount ?? 0) - creditedAmount,
    ))
    return invoiceAmount == null
        || invoicePaidAmount == null
        || transactionInflow == null
        || amountAfterCredits !== currencyCents(invoicePaidAmount)
        || currencyCents(invoicePaidAmount) !== currencyCents(transactionInflow)
}
