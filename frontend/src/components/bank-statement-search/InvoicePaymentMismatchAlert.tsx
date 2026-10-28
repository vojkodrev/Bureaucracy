import { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { BankStatementEntry, BankStatementInvoicePayment } from '@/lib/bank-statement-types'
import { formatDate } from '@/lib/formatters'
import {
    duplicateInvoiceNumbers,
    hasPaidAmountMismatch,
    hasPaymentDateMismatch,
    normalizeInvoiceNumber,
} from './invoice-payment-mismatches'

type InvoicePaymentMismatchAlertProps = {
    entries: BankStatementEntry[]
    invoicePayments: Record<string, BankStatementInvoicePayment>
}

function InvoicePaymentMismatchAlert({
    entries,
    invoicePayments,
}: InvoicePaymentMismatchAlertProps) {
    const [dismissed, setDismissed] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const duplicateDocuments = duplicateInvoiceNumbers(entries)
    const mismatches = entries.flatMap((entry) => {
        const invoicePayment = entry.documentNumber
            ? invoicePayments[normalizeInvoiceNumber(entry.documentNumber)]
            : undefined
        const duplicate = entry.documentNumber
            ? duplicateDocuments.has(normalizeInvoiceNumber(entry.documentNumber))
            : false
        if (!invoicePayment) return duplicate
            ? [{ entry, paymentDateMismatch: false, paidAmountMismatch: false, duplicate }]
            : []

        const paymentDateMismatch = hasPaymentDateMismatch(
            entry.paymentDate,
            invoicePayment.paymentDate,
        )
        const paidAmountMismatch = hasPaidAmountMismatch(
            invoicePayment.amount,
            invoicePayment.paidAmount,
            entry.inflow,
        )
        return paymentDateMismatch || paidAmountMismatch || duplicate
            ? [{ entry, paymentDateMismatch, paidAmountMismatch, duplicate }]
            : []
    })

    if (dismissed || mismatches.length === 0) return null

    return (
        <Alert
            variant="warning"
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            className="mb-6 max-w-4xl cursor-pointer"
            onClick={() => setExpanded((current) => !current)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setExpanded((current) => !current)
                }
            }}
        >
            <TriangleAlert />
            <AlertTitle>
                {mismatches.length} bank transaction {mismatches.length === 1 ? 'warning' : 'warnings'}
            </AlertTitle>
            {expanded && (
                <AlertDescription>
                    <p>
                        The following bank transactions have invoice payment or duplicate booking warnings.
                    </p>
                    <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                        {mismatches.map(({ entry, paymentDateMismatch, paidAmountMismatch, duplicate }) => (
                            <li key={entry.id}>
                                {formatDate(entry.paymentDate)} — {entry.customerName || 'Unknown counterparty'}
                                <span className="ml-1 font-medium">
                                    — {[
                                        paymentDateMismatch ? 'Payment date' : null,
                                        paidAmountMismatch ? 'Paid amount' : null,
                                        duplicate ? 'Document booked more than once' : null,
                                    ].filter(Boolean).join(' and ')}
                                </span>
                            </li>
                        ))}
                    </ul>
                </AlertDescription>
            )}
            <AlertAction>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Dismiss bank transaction warnings"
                    onClick={(event) => {
                        event.stopPropagation()
                        setDismissed(true)
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    <X />
                </Button>
            </AlertAction>
        </Alert>
    )
}

export default InvoicePaymentMismatchAlert
