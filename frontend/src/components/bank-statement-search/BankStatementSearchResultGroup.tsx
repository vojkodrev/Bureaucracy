import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import type { BankStatementEntry } from '@/lib/bank-statement-types'
import { formatCurrency, formatDate } from '@/lib/formatters'

type BankStatementSearchResultGroupProps = {
    entries: BankStatementEntry[]
}

function BankStatementSearchResultGroup({ entries }: BankStatementSearchResultGroupProps) {
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
            {entries.map((entry) => (
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
            ))}
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
