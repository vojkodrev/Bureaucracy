import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import Pager from '@/components/Pager'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'

type InvoiceSearchResultsByCustomerProps = {
    invoicePage: InvoicePage | null
    invoices: Invoice[]
    isLoading: boolean
    mode: ComponentMode
    selectedInvoiceNumber: string | null
    onInvoiceSelect: (invoice: Invoice) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

function groupInvoicesByCustomer(invoices: Invoice[]): Invoice[][] {
    const groups: Invoice[][] = []
    for (const invoice of invoices) {
        const key = `${invoice.customerCode ?? ''}\0${invoice.customerName ?? ''}`
        const currentGroup = groups.at(-1)
        const currentInvoice = currentGroup?.[0]
        const currentKey = currentInvoice
            ? `${currentInvoice.customerCode ?? ''}\0${currentInvoice.customerName ?? ''}`
            : null
        if (!currentGroup || currentKey !== key) groups.push([invoice])
        else currentGroup.push(invoice)
    }
    return groups
}

function InvoiceSearchResultsByCustomer({
    invoicePage,
    invoices,
    isLoading,
    mode,
    selectedInvoiceNumber,
    onInvoiceSelect,
    onPageChange,
    onPageSizeChange,
}: InvoiceSearchResultsByCustomerProps) {
    const firstInvoice = invoicePage && invoicePage.totalCount > 0
        ? (invoicePage.page - 1) * invoicePage.pageSize + 1
        : 0
    const lastInvoice = invoicePage
        ? Math.min(invoicePage.page * invoicePage.pageSize, invoicePage.totalCount)
        : 0
    const isPageMode = mode === ComponentMode.Page
    const customerGroups = groupInvoicesByCustomer(invoices)

    return (
        <div className="mt-8">
            {invoicePage && (
                <Pager
                    firstItem={firstInvoice}
                    lastItem={lastInvoice}
                    page={invoicePage.page}
                    pageSize={invoicePage.pageSize}
                    totalItems={invoicePage.totalCount}
                    totalPages={invoicePage.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice number</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Invoice date</TableHead>
                        <TableHead>Due date</TableHead>
                        <TableHead>Payment date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Loading invoices…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && customerGroups.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No invoices found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && customerGroups.map((customerInvoices) => {
                        const customer = customerInvoices[0]
                        const customerKey = `${customer.customerCode ?? ''}:${customer.customerName ?? ''}`
                        const totalInvoiced = customerInvoices.reduce(
                            (sum, invoice) => sum + (invoice.amount ?? 0),
                            0,
                        )
                        const totalPaid = customerInvoices.reduce(
                            (sum, invoice) => invoice.paymentDate
                                ? sum + (invoice.amount ?? 0)
                                : sum,
                            0,
                        )
                        const totalOutstanding = customerInvoices.reduce(
                            (sum, invoice) => !invoice.paymentDate
                                ? sum + (invoice.amount ?? 0)
                                : sum,
                            0,
                        )
                        const totalOverdue = customerInvoices.reduce(
                            (sum, invoice) => !invoice.paymentDate
                                && invoice.dueDate
                                && new Date(invoice.dueDate) < new Date()
                                ? sum + (invoice.amount ?? 0)
                                : sum,
                            0,
                        )
                        const totals = [
                            ['Total paid', totalPaid],
                            ['Total outstanding', totalOutstanding],
                            ['Of which overdue', totalOverdue],
                            ['Total invoiced', totalInvoiced],
                        ] as const

                        return (
                            <Fragment key={customerKey}>
                                {customerInvoices.map((invoice) => (
                                    <TableRow
                                        key={invoice.invoiceNumber}
                                        data-state={selectedInvoiceNumber === invoice.invoiceNumber
                                            ? 'selected'
                                            : undefined}
                                        className="relative cursor-pointer"
                                        tabIndex={isPageMode ? undefined : 0}
                                        onClick={isPageMode
                                            ? undefined
                                            : () => onInvoiceSelect(invoice)}
                                        onKeyDown={isPageMode
                                            ? undefined
                                            : (event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault()
                                                    onInvoiceSelect(invoice)
                                                }
                                            }}
                                    >
                                        <TableCell className="font-medium">
                                            {isPageMode && (
                                                <Link
                                                    to={`/invoice/${encodeURIComponent(invoice.invoiceNumber)}`}
                                                    aria-label={`Open invoice ${invoice.invoiceNumber}`}
                                                    className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                                                />
                                            )}
                                            {invoice.invoiceNumber}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.customerName ?? invoice.customerCode ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(invoice.amount ?? 0)}
                                        </TableCell>
                                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                        <TableCell>{formatDate(invoice.paymentDate)}</TableCell>
                                    </TableRow>
                                ))}
                                {totals.map(([label, amount], index) => (
                                    <TableRow
                                        key={label}
                                        className={index === totals.length - 1
                                            ? 'border-b-2 font-medium'
                                            : 'font-medium'}
                                    >
                                        <TableCell colSpan={2} className="text-right">
                                            {label}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(amount)}
                                        </TableCell>
                                        <TableCell colSpan={3} />
                                    </TableRow>
                                ))}
                            </Fragment>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default InvoiceSearchResultsByCustomer
