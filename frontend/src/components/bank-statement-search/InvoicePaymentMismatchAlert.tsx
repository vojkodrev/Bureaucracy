import { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { BankStatementEntry, BankStatementInvoicePayment } from '@/lib/bank-statement-types'
import { formatDate } from '@/lib/formatters'
import {
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
    const mismatches = entries.flatMap((entry) => {
        const invoicePayment = entry.documentNumber
            ? invoicePayments[normalizeInvoiceNumber(entry.documentNumber)]
            : undefined
        if (!invoicePayment) return []

        const paymentDateMismatch = hasPaymentDateMismatch(
            entry.paymentDate,
            invoicePayment.paymentDate,
        )
        const paidAmountMismatch = hasPaidAmountMismatch(entry.inflow, invoicePayment.paidAmount)
        return paymentDateMismatch || paidAmountMismatch
            ? [{ entry, paymentDateMismatch, paidAmountMismatch }]
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
                {mismatches.length} invoice payment {mismatches.length === 1 ? 'mismatch' : 'mismatches'}
            </AlertTitle>
            {expanded && (
                <AlertDescription>
                    <p>
                        The following bank transactions do not match their invoice payment details.
                    </p>
                    <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
                        {mismatches.map(({ entry, paymentDateMismatch, paidAmountMismatch }) => (
                            <li key={entry.id}>
                                {formatDate(entry.paymentDate)} — {entry.customerName || 'Unknown counterparty'}
                                <span className="ml-1 font-medium">
                                    — {[
                                        paymentDateMismatch ? 'Payment date' : null,
                                        paidAmountMismatch ? 'Paid amount' : null,
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
                    aria-label="Dismiss invoice payment mismatch warning"
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
