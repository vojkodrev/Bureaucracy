import { ExternalLink } from 'lucide-react'
import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { formatDate } from '@/lib/formatters'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'
import type { InvoiceSearchCriteria, InvoiceSortColumn } from './types'
import { invoiceSortColumns } from './types'
import InvoicePaymentDate from './InvoicePaymentDate'
import SearchResultCell from '@/components/SearchResultCell'
import InvoiceAmount from './InvoiceAmount'

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
    const hasLinkedRows = mode !== ComponentMode.Dialog
    const openInvoices = () => {
        invoices.forEach((invoice) => {
            window.open(
                `/invoice/${encodeURIComponent(invoice.invoiceNumber)}`,
                '_blank',
                'noopener,noreferrer',
            )
        })
    }

    return (
        <div className={showSearchFields ? 'mt-8' : undefined}>
            {invoicePage && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {isPageMode && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mb-2"
                            disabled={isLoading || invoices.length === 0}
                            onClick={openInvoices}
                        >
                            <ExternalLink />
                            Open {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
                        </Button>
                    )}
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
                </div>
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
                            tabIndex={hasLinkedRows ? undefined : 0}
                            onClick={hasLinkedRows ? undefined : () => onInvoiceSelect(invoice)}
                            onKeyDown={hasLinkedRows
                                ? undefined
                                : (event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        onInvoiceSelect(invoice)
                                    }
                                }}
                        >
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`} primary
                                className="font-medium"
                            >
                                {invoice.invoiceNumber}
                            </SearchResultCell>
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >
                                {invoice.customerName ?? invoice.customerCode ?? '—'}
                            </SearchResultCell>
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                                className="text-right"
                            >
                                <InvoiceAmount
                                    amount={invoice.amount}
                                    creditedAmount={invoice.creditedAmount}
                                />
                            </SearchResultCell>
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >{formatDate(invoice.issueDate)}</SearchResultCell>
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >{formatDate(invoice.dueDate)}</SearchResultCell>
                            <SearchResultCell
                                to={hasLinkedRows ? `/invoice/${encodeURIComponent(invoice.invoiceNumber)}` : undefined}
                                linkLabel={`Open invoice ${invoice.invoiceNumber}`}
                            >
                                <InvoicePaymentDate
                                    invoiceNumber={invoice.invoiceNumber}
                                    amount={invoice.amount}
                                    creditedAmount={invoice.creditedAmount}
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
