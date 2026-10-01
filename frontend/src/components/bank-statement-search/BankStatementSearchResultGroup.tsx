import { Fragment } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { BankStatementEntry, BankStatementInvoicePayment } from '@/lib/bank-statement-types'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
    hasPaidAmountMismatch,
    hasPaymentDateMismatch,
    normalizeInvoiceNumber,
} from './invoice-payment-mismatches'

type BankStatementSearchResultGroupProps = {
    entries: BankStatementEntry[]
    invoicePayments: Record<string, BankStatementInvoicePayment>
}

function BankStatementSearchResultGroup({ entries, invoicePayments }: BankStatementSearchResultGroupProps) {
    const statement = entries[0]
    const netMovement = entries.reduce(
        (sum, entry) => sum + (entry.inflow ?? 0) - (entry.outflow ?? 0),
        0,
    )

    return (
        <Fragment>
            <TableRow className="relative cursor-pointer bg-muted/60">
                <TableCell colSpan={6} className="font-semibold">
                    {statement.statementNumber != null && (
                        <Link
                            to={`/bank-statement/${statement.statementNumber}`}
                            aria-label={`Open bank statement ${statement.statementNumber}`}
                            className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                        />
                    )}
                    Statement {statement.statementNumber ?? '—'}
                </TableCell>
            </TableRow>
            {entries.map((entry) => {
                const invoicePayment = entry.documentNumber
                    ? invoicePayments[normalizeInvoiceNumber(entry.documentNumber)]
                    : undefined
                const paymentDateMismatch = invoicePayment
                    ? hasPaymentDateMismatch(entry.paymentDate, invoicePayment.paymentDate)
                    : false
                const paidAmountMismatch = invoicePayment
                    ? hasPaidAmountMismatch(entry.inflow, invoicePayment.paidAmount)
                    : false
                return (
                <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.paymentDate)}</TableCell>
                    <TableCell>{entry.customerName || '—'}</TableCell>
                    <TableCell>{entry.transactionType || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                        {entry.outflow == null ? '—' : formatCurrency(entry.outflow)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                        {entry.inflow == null ? '—' : formatCurrency(entry.inflow)}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                            {entry.documentNumber ? (
                                <Button
                                    variant="link"
                                    render={
                                        <Link
                                            to={`/invoice/${encodeURIComponent(entry.documentNumber)}`}
                                        />
                                    }
                                >
                                    {entry.documentNumber}
                                </Button>
                            ) : '—'}
                            {entry.documentNumber && invoicePayment
                                && (paymentDateMismatch || paidAmountMismatch) && (
                                <MismatchWarning
                                    documentNumber={entry.documentNumber}
                                    paymentDateMismatch={paymentDateMismatch}
                                    paidAmountMismatch={paidAmountMismatch}
                                    transactionDate={entry.paymentDate}
                                    invoicePaymentDate={invoicePayment.paymentDate}
                                    transactionInflow={entry.inflow}
                                    invoicePaidAmount={invoicePayment.paidAmount}
                                />
                            )}
                        </div>
                    </TableCell>
                </TableRow>
                )
            })}
            <TableRow className="border-b-2 font-medium">
                <TableCell colSpan={3} className="text-right">Net movement</TableCell>
                <TableCell colSpan={3} className="text-right tabular-nums">
                    {formatCurrency(netMovement)}
                </TableCell>
            </TableRow>
        </Fragment>
    )
}

type MismatchWarningProps = {
    documentNumber: string
    paymentDateMismatch: boolean
    paidAmountMismatch: boolean
    transactionDate: string | null
    invoicePaymentDate: string | null
    transactionInflow: number | null
    invoicePaidAmount: number | null
}

function MismatchWarning({
    documentNumber,
    paymentDateMismatch,
    paidAmountMismatch,
    transactionDate,
    invoicePaymentDate,
    transactionInflow,
    invoicePaidAmount,
}: MismatchWarningProps) {
    const label = paymentDateMismatch && paidAmountMismatch
        ? 'Payment date and amount mismatch'
        : paymentDateMismatch
            ? 'Payment date mismatch'
            : 'Paid amount mismatch'

    return (
        <Tooltip>
            <TooltipTrigger
                render={(
                    <Link
                        to={`/invoice/${encodeURIComponent(documentNumber)}`}
                        className="relative z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-900 hover:underline dark:bg-amber-950 dark:text-amber-200"
                    />
                )}
            >
                <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                {label}
            </TooltipTrigger>
            <TooltipContent>
                <div className="space-y-1 text-left">
                    {paymentDateMismatch && (
                        <p>
                            Transaction date {formatDate(transactionDate)} does not match invoice payment date {formatDate(invoicePaymentDate)}.
                        </p>
                    )}
                    {paidAmountMismatch && (
                        <p>
                            Transaction inflow {transactionInflow == null ? '—' : formatCurrency(transactionInflow)} does not match invoice paid amount {invoicePaidAmount == null ? '—' : formatCurrency(invoicePaidAmount)}.
                        </p>
                    )}
                    <p>Click to open invoice {documentNumber}.</p>
                </div>
            </TooltipContent>
        </Tooltip>
    )
}

export default BankStatementSearchResultGroup
