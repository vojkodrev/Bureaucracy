export function normalizeInvoiceNumber(value: string) {
    return value.trim().toUpperCase()
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
    transactionInflow: number | null,
    invoicePaidAmount: number | null,
) {
    return transactionInflow == null
        || invoicePaidAmount == null
        || Math.round(transactionInflow * 100) !== Math.round(invoicePaidAmount * 100)
}
