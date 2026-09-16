import { useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'

type InvoiceSearchSummaryProps = {
    invoices: Invoice[]
}

function InvoiceSearchSummary({ invoices }: InvoiceSearchSummaryProps) {
    const summary = useMemo(() => {
        const total = invoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
        const unpaidInvoices = invoices.filter((invoice) => !invoice.paymentDate)
        const pastDueInvoices = unpaidInvoices.filter(
            (invoice) => invoice.dueDate && new Date(invoice.dueDate) < new Date(),
        )
        const paidInvoices = invoices.filter((invoice) => invoice.paymentDate)

        return {
            total,
            unpaid: unpaidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            pastDue: pastDueInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            paid: paidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
        }
    }, [invoices])

    return (
        <div className="mt-8 max-w-sm">
            <h2 className="mb-2 text-sm font-medium">Summary</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Total amount</TableCell>
                        <TableCell className="text-right font-medium">
                            {formatCurrency(summary.total)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Unpaid</TableCell>
                        <TableCell className="text-right font-medium">
                            {formatCurrency(summary.unpaid)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Past due</TableCell>
                        <TableCell className="text-right font-medium">
                            {formatCurrency(summary.pastDue)}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Paid</TableCell>
                        <TableCell className="text-right font-medium">
                            {formatCurrency(summary.paid)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

export default InvoiceSearchSummary
