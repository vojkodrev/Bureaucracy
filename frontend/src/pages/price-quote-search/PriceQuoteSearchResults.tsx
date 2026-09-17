import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type {
    PriceQuotePage,
    PriceQuoteSearchCriteria,
    PriceQuoteSortColumn,
} from './types'
import { priceQuoteSortColumns } from './types'

const labels: Record<PriceQuoteSortColumn, string> = {
    quoteNumber: 'Quote number',
    customer: 'Customer',
    amount: 'Amount',
    issueDate: 'Quote date',
    dueDate: 'Due date',
}

type Props = {
    result: PriceQuotePage | null
    loading: boolean
    search: PriceQuoteSearchCriteria
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    onSort: (column: PriceQuoteSortColumn) => void
}

export default function PriceQuoteSearchResults({
    result,
    loading,
    search,
    onPageChange,
    onPageSizeChange,
    onSort,
}: Props) {
    const first = result && result.totalCount
        ? (result.page - 1) * result.pageSize + 1
        : 0
    const last = result
        ? Math.min(result.page * result.pageSize, result.totalCount)
        : 0

    return (
        <div className="mt-8">
            {result && (
                <Pager
                    firstItem={first}
                    lastItem={last}
                    page={result.page}
                    pageSize={result.pageSize}
                    totalItems={result.totalCount}
                    totalPages={result.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        {priceQuoteSortColumns.map((column) => (
                            <SortableTableHead
                                key={column}
                                label={labels[column]}
                                direction={
                                    search.sortBy === column
                                        ? search.sortDirection
                                        : ''
                                }
                                alignRight={column === 'amount'}
                                onSort={() => onSort(column)}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading price quotes…
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && result?.priceQuotes.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No price quotes found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && result?.priceQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                            <TableCell className="font-medium">
                                {quote.quoteNumber}
                            </TableCell>
                            <TableCell>
                                {quote.customerName ?? quote.customerCode ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(quote.amount ?? 0)}
                            </TableCell>
                            <TableCell>{formatDate(quote.issueDate)}</TableCell>
                            <TableCell>{formatDate(quote.dueDate)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
