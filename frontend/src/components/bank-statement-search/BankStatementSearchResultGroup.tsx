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
                return (
                <TableRow key={entry.id}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {formatDate(entry.paymentDate)}
                            {invoicePayment && hasPaymentDateMismatch(entry.paymentDate, invoicePayment.paymentDate) && (
                                <MismatchWarning label="Payment date mismatch">
                                    The transaction date does not match the invoice payment date ({formatDate(invoicePayment.paymentDate)}).
                                </MismatchWarning>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>{entry.customerName || '—'}</TableCell>
                    <TableCell>{entry.transactionType || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                        {entry.outflow == null ? '—' : formatCurrency(entry.outflow)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                            {entry.inflow == null ? '—' : formatCurrency(entry.inflow)}
                            {invoicePayment && hasPaidAmountMismatch(entry.inflow, invoicePayment.paidAmount) && (
                                <MismatchWarning label="Paid amount mismatch">
                                    The transaction inflow does not match the invoice paid amount ({invoicePayment.paidAmount == null ? '—' : formatCurrency(invoicePayment.paidAmount)}).
                                </MismatchWarning>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>
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

function MismatchWarning({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <Tooltip>
            <TooltipTrigger
                aria-label={label}
                className="inline-flex shrink-0 rounded-md bg-amber-50 p-1 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
                <AlertTriangleIcon className="size-4" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{children}</TooltipContent>
        </Tooltip>
    )
}

export default BankStatementSearchResultGroup
