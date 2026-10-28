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
import type { PaymentStatus } from './types'

type InvoiceSearchSummaryProps = {
    invoices: Invoice[]
    paymentStatus: PaymentStatus
}

function InvoiceSearchSummary({ invoices, paymentStatus }: InvoiceSearchSummaryProps) {
    const summary = useMemo(() => {
        const total = invoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
        const unpaidInvoices = invoices.filter((invoice) => !invoice.paymentDate)
        const pastDueInvoices = unpaidInvoices.filter(
            (invoice) => {
                const effectiveDueDate = invoice.dueDate ?? invoice.issueDate
                return effectiveDueDate && new Date(effectiveDueDate) < new Date()
            },
        )
        const paidInvoices = invoices.filter((invoice) => invoice.paymentDate)

        return {
            total,
            unpaid: unpaidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            pastDue: pastDueInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            paid: paidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
        }
    }, [invoices])

    const allRows = [
        ['Total amount', summary.total],
        ['Unpaid', summary.unpaid],
        ['Past due', summary.pastDue],
        ['Paid', summary.paid],
    ] as const
    const rows = paymentStatus === 'paid'
        ? allRows.slice(3, 4)
        : paymentStatus === 'overdue'
            ? [['Total overdue', summary.pastDue] as const]
            : allRows

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
                    {rows.map(([label, amount]) => (
                        <TableRow key={label}>
                            <TableCell>{label}</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default InvoiceSearchSummary
