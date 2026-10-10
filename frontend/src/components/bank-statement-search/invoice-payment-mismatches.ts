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
