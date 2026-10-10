import SearchResultCell from '@/components/SearchResultCell'
import InvoicePaymentWarnings from '@/components/InvoicePaymentWarnings'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
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
            <TableRow className="cursor-pointer bg-muted/60">
                <SearchResultCell
                    primary
                    to={statement.statementNumber != null ? `/bank-statement/${statement.statementNumber}` : undefined}
                    linkLabel={`Open bank statement ${statement.statementNumber}`}
                    colSpan={6}
                    className="font-semibold"
                >
                    Statement {statement.statementNumber ?? '—'}
                </SearchResultCell>
            </TableRow>
            {entries.map((entry) => {
                const invoicePayment = entry.documentNumber
                    ? invoicePayments[normalizeInvoiceNumber(entry.documentNumber)]
                    : undefined
                const paymentDateMismatch = invoicePayment
                    ? hasPaymentDateMismatch(entry.paymentDate, invoicePayment.paymentDate)
                    : false
                const paidAmountMismatch = invoicePayment
                    ? hasPaidAmountMismatch(
                        invoicePayment.amount,
                        invoicePayment.paidAmount,
                        entry.inflow,
                    )
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
                                <InvoicePaymentWarnings
                                    paidAmount={invoicePayment.paidAmount}
                                    href={`/invoice/${encodeURIComponent(entry.documentNumber)}`}
                                    dateIssue={paymentDateMismatch ? 'mismatch' : undefined}
                                    dateTooltip={(
                                        <>Transaction date {formatDate(entry.paymentDate)} does not match invoice payment date {formatDate(invoicePayment.paymentDate)}. Click to open invoice {entry.documentNumber}.</>
                                    )}
                                    amountMismatch={paidAmountMismatch}
                                    amountTooltip={(
                                        <>Invoice amount {invoicePayment.amount == null ? '—' : formatCurrency(invoicePayment.amount)}, paid amount {invoicePayment.paidAmount == null ? '—' : formatCurrency(invoicePayment.paidAmount)}, and transaction inflow {entry.inflow == null ? '—' : formatCurrency(entry.inflow)} do not match. Click to open invoice {entry.documentNumber}.</>
                                    )}
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

export default BankStatementSearchResultGroup
