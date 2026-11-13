import Pager from '@/components/Pager'
import SearchResultCell from '@/components/SearchResultCell'
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
    DeliveryNotePage,
    DeliveryNoteSearchCriteria,
    DeliveryNoteSortColumn,
} from './types'
import { deliveryNoteSortColumns } from './types'

const labels: Record<DeliveryNoteSortColumn, string> = {
    deliveryNoteNumber: 'Delivery note number',
    customer: 'Customer',
    amount: 'Amount',
    issueDate: 'Issue date',
    deliveryDate: 'Delivery date',
}

type Props = {
    result: DeliveryNotePage | null
    loading: boolean
    search: DeliveryNoteSearchCriteria
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    onSort: (column: DeliveryNoteSortColumn) => void
}

export default function DeliveryNoteSearchResults(props: Props) {
    const { result, loading, search } = props
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
                    onPageChange={props.onPageChange}
                    onPageSizeChange={props.onPageSizeChange}
                />
            )}
            <Table aria-busy={loading}>
                <TableHeader>
                    <TableRow>
                        {deliveryNoteSortColumns.map((column) => (
                            <SortableTableHead
                                key={column}
                                label={labels[column]}
                                direction={search.sortBy === column
                                    ? search.sortDirection
                                    : ''}
                                alignRight={column === 'amount'}
                                onSort={() => props.onSort(column)}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && !result?.deliveryNotes.length && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading delivery notes…
                            </TableCell>
                        </TableRow>
                    )}
                    {!loading && result?.deliveryNotes.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No delivery notes found.
                            </TableCell>
                        </TableRow>
                    )}
                    {result?.deliveryNotes.map((note) => {
                        const path = `/delivery-note/${encodeURIComponent(
                            note.deliveryNoteNumber,
                        )}`
                        const label = `Open delivery note ${note.deliveryNoteNumber}`
                        return (
                            <TableRow key={note.id} className="cursor-pointer">
                                <SearchResultCell
                                    primary
                                    to={path}
                                    linkLabel={label}
                                    className="font-medium"
                                >
                                    {note.deliveryNoteNumber}
                                </SearchResultCell>
                                <SearchResultCell to={path} linkLabel={label}>
                                    {note.customerName
                                        ?? note.customerCode
                                        ?? '—'}
                                </SearchResultCell>
                                <SearchResultCell
                                    to={path}
                                    linkLabel={label}
                                    className="text-right"
                                >
                                    {note.withoutAmounts
                                        ? 'Hidden'
                                        : formatCurrency(note.amount ?? 0)}
                                </SearchResultCell>
                                <SearchResultCell to={path} linkLabel={label}>
                                    {formatDate(note.issueDate)}
                                </SearchResultCell>
                                <SearchResultCell to={path} linkLabel={label}>
                                    {formatDate(note.deliveryDate)}
                                </SearchResultCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
