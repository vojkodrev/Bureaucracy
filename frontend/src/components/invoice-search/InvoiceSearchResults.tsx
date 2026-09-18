import { Link } from 'react-router-dom'
import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'
import type { InvoiceSearchCriteria, InvoiceSortColumn } from './types'
import { invoiceSortColumns } from './types'
import InvoicePaymentDate from './InvoicePaymentDate'

type InvoiceSearchResultsProps = {
    invoicePage: InvoicePage | null
    invoices: Invoice[]
    isLoading: boolean
    mode: ComponentMode
    search: InvoiceSearchCriteria
    selectedInvoiceNumber: string | null
    onInvoiceSelect: (invoice: Invoice) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: (sortBy: InvoiceSortColumn) => void
}

const columnLabels: Record<InvoiceSortColumn, string> = {
    invoiceNumber: 'Invoice number',
    customer: 'Customer',
    amount: 'Amount',
    issueDate: 'Invoice date',
    dueDate: 'Due date',
    paymentDate: 'Payment date',
}

function InvoiceSearchResults({
    invoicePage,
    invoices,
    isLoading,
    mode,
    search,
    selectedInvoiceNumber,
    onInvoiceSelect,
    onPageChange,
    onPageSizeChange,
    onSort,
}: InvoiceSearchResultsProps) {
    const firstInvoice = invoicePage && invoicePage.totalCount > 0
        ? (invoicePage.page - 1) * invoicePage.pageSize + 1
        : 0
    const lastInvoice = invoicePage
        ? Math.min(invoicePage.page * invoicePage.pageSize, invoicePage.totalCount)
        : 0
    const isPageMode = mode === ComponentMode.Page

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
                        {invoiceSortColumns.map((sortBy) => (
                            <SortableTableHead
                                key={sortBy}
                                label={columnLabels[sortBy]}
                                direction={search.sortBy === sortBy ? search.sortDirection : ''}
                                alignRight={sortBy === 'amount'}
                                onSort={() => onSort(sortBy)}
                            />
                        ))}
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
                    {!isLoading && invoices.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No invoices found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && invoices.map((invoice) => (
                        <TableRow
                            key={invoice.invoiceNumber}
                            data-state={selectedInvoiceNumber === invoice.invoiceNumber
                                ? 'selected'
                                : undefined}
                            className="relative cursor-pointer"
                            tabIndex={isPageMode ? undefined : 0}
                            onClick={isPageMode ? undefined : () => onInvoiceSelect(invoice)}
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
                            <TableCell className="text-right">
                                {formatCurrency(invoice.amount ?? 0)}
                            </TableCell>
                            <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell>
                                <InvoicePaymentDate
                                    paidAmount={invoice.paidAmount}
                                    paymentDate={invoice.paymentDate}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default InvoiceSearchResults
