import { useEffect, useMemo, useState } from 'react'
import type { BankStatementInvoicePayment, BankStatementPage } from '@/lib/bank-statement-types'
import { fetchBankStatementInvoicePayments } from '../bank-statement-search-api'

type InvoicePaymentResult = {
    key: string
    payments: Record<string, BankStatementInvoicePayment>
    error: string | null
}

export function useBankStatementInvoicePayments(
    statementPage: BankStatementPage | null,
    searchKey: string,
) {
    const invoiceNumbers = useMemo(() => [
        ...new Set(
            statementPage?.entries.flatMap(({ documentNumber }) => {
                const value = documentNumber?.trim()
                return value ? [value] : []
            }) ?? [],
        ),
    ], [statementPage])
    const requestKey = statementPage
        ? `${searchKey}:${invoiceNumbers.map(normalizeInvoiceNumber).join(',')}`
        : '__disabled__'
    const [result, setResult] = useState<InvoicePaymentResult>({
        key: '__initial__',
        payments: {},
        error: null,
    })
    const hasInvoiceNumbers = invoiceNumbers.length > 0
    const isLoading = statementPage != null && hasInvoiceNumbers && result.key !== requestKey

    useEffect(() => {
        if (!statementPage || invoiceNumbers.length === 0) return

        const controller = new AbortController()
        void fetchBankStatementInvoicePayments(invoiceNumbers, controller.signal)
            .then((payments) => setResult({
                key: requestKey,
                payments: Object.fromEntries(payments.map((payment) => [
                    normalizeInvoiceNumber(payment.invoiceNumber),
                    payment,
                ])),
                error: null,
            }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setResult({
                    key: requestKey,
                    payments: {},
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Invoice payments could not be loaded',
                })
            })
        return () => controller.abort()
    }, [invoiceNumbers, requestKey, statementPage])

    return {
        payments: hasInvoiceNumbers && !isLoading ? result.payments : {},
        isLoading,
        error: hasInvoiceNumbers && !isLoading ? result.error : null,
    }
}

export function normalizeInvoiceNumber(value: string) {
    return value.trim().toUpperCase()
}
