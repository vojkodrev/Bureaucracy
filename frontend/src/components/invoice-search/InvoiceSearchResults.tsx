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
import SearchResultCell from '@/components/SearchResultCell'

type InvoiceSearchResultsProps = {
    invoicePage: InvoicePage | null
    invoices: Invoice[]
    isLoading: boolean
    mode: ComponentMode
    search: InvoiceSearchCriteria
    showSearchFields: boolean
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
    showSearchFields,
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
        <div className={showSearchFields ? 'mt-8' : undefined}>
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
            <Table aria-busy={isLoading}>
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
                    {isLoading && invoices.length === 0 && (
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
                    {invoices.map((invoice) => (
                        <TableRow
                            key={invoice.invoiceNumber}
                            data-state={selectedInvoiceNumber === invoice.invoiceNumber
                                ? 'selected'
                                : undefined}
                            className="cursor-pointer"
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
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`} primary
                                className="font-medium"
                            >
                                {invoice.invoiceNumber}
                            </SearchResultCell>
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >
                                {invoice.customerName ?? invoice.customerCode ?? '—'}
                            </SearchResultCell>
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                                className="text-right"
                            >
                                {formatCurrency(invoice.amount ?? 0)}
                            </SearchResultCell>
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >{formatDate(invoice.issueDate)}</SearchResultCell>
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >{formatDate(invoice.dueDate)}</SearchResultCell>
                            <SearchResultCell
                                to={isPageMode ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >
                                <InvoicePaymentDate
                                    invoiceNumber={invoice.invoiceNumber}
                                    amount={invoice.amount}
                                    paidAmount={invoice.paidAmount}
                                    paymentDate={invoice.paymentDate}
                                />
                            </SearchResultCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default InvoiceSearchResults
