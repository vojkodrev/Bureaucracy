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
import type { Invoice, InvoiceCustomerSummaryPage } from '@/lib/invoice-types'

type InvoiceSearchResultsByCustomerProps = {
    summaryPage: InvoiceCustomerSummaryPage | null
    isLoading: boolean
    mode: ComponentMode
    selectedInvoiceNumber: string | null
    onInvoiceSelect: (invoice: Invoice) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

function InvoiceSearchResultsByCustomer({
    summaryPage,
    isLoading,
    mode,
    selectedInvoiceNumber,
    onInvoiceSelect,
    onPageChange,
    onPageSizeChange,
}: InvoiceSearchResultsByCustomerProps) {
    const firstInvoice = summaryPage && summaryPage.totalCount > 0
        ? (summaryPage.page - 1) * summaryPage.pageSize + 1
        : 0
    const lastInvoice = summaryPage
        ? Math.min(summaryPage.page * summaryPage.pageSize, summaryPage.totalCount)
        : 0
    const isPageMode = mode === ComponentMode.Page
    const customerSummaries = summaryPage?.customerSummaries ?? []

    return (
        <div className="mt-8">
            {summaryPage && (
                <Pager
                    firstItem={firstInvoice}
                    lastItem={lastInvoice}
                    page={summaryPage.page}
                    pageSize={summaryPage.pageSize}
                    totalItems={summaryPage.totalCount}
                    totalPages={summaryPage.totalPages}
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
                    {!isLoading && customerSummaries.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No invoices found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && customerSummaries.map((summary) => {
                        const customerKey = `${summary.customerCode ?? ''}:${summary.customerName ?? ''}`
                        const totals = [
                            ['Total paid', summary.totalPaid],
                            ['Total outstanding', summary.totalOutstanding],
                            ['Of which overdue', summary.totalOverdue],
                            ['Total invoiced', summary.totalInvoiced],
                        ] as const

                        return (
                            <Fragment key={customerKey}>
                                {summary.invoices.map((invoice) => (
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
