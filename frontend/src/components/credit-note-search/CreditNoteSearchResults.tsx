import Pager from '@/components/Pager'
import SearchResultCell from '@/components/SearchResultCell'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { CreditNote, CreditNotePage } from '@/pages/credit-note/types'
import type { CreditNoteSearchCriteria, CreditNoteSortColumn } from './types'
import { creditNoteSortColumns } from './types'

const labels: Record<CreditNoteSortColumn, string> = {
    creditNoteNumber: 'Credit note number',
    customer: 'Customer',
    amount: 'Amount',
    issueDate: 'Credit note date',
    dueDate: 'Due date',
}

type Props = {
    creditNotePage: CreditNotePage | null
    isLoading: boolean
    mode: ComponentMode
    search: CreditNoteSearchCriteria
    onCreditNoteSelect?: (creditNote: CreditNote) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: (column: CreditNoteSortColumn) => void
}

export default function CreditNoteSearchResults(props: Props) {
    const page = props.creditNotePage
    const first = page?.totalCount
        ? (page.page - 1) * page.pageSize + 1
        : 0
    const last = page
        ? Math.min(page.page * page.pageSize, page.totalCount)
        : 0
    return (
        <div className="mt-8">
            {page && (
                <Pager
                    firstItem={first}
                    lastItem={last}
                    page={page.page}
                    pageSize={page.pageSize}
                    totalItems={page.totalCount}
                    totalPages={page.totalPages}
                    onPageChange={props.onPageChange}
                    onPageSizeChange={props.onPageSizeChange}
                />
            )}
            <Table aria-busy={props.isLoading}>
                <TableHeader>
                    <TableRow>
                        {creditNoteSortColumns.map((column) => (
                            <SortableTableHead
                                key={column}
                                label={labels[column]}
                                direction={props.search.sortBy === column
                                    ? props.search.sortDirection
                                    : ''}
                                alignRight={column === 'amount'}
                                onSort={() => props.onSort(column)}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.isLoading && !page?.creditNotes.length && (
                        <MessageRow>Loading credit notes…</MessageRow>
                    )}
                    {!props.isLoading && page?.creditNotes.length === 0 && (
                        <MessageRow>No credit notes found.</MessageRow>
                    )}
                    {page?.creditNotes.map((note) => (
                        <CreditNoteRow
                            key={note.id}
                            note={note}
                            mode={props.mode}
                            onSelect={props.onCreditNoteSelect}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function CreditNoteRow({
    note,
    mode,
    onSelect,
}: {
    note: CreditNote
    mode: ComponentMode
    onSelect?: (creditNote: CreditNote) => void
}) {
    const path = mode === ComponentMode.Page
        ? `/credit-note/${encodeURIComponent(note.creditNoteNumber)}`
        : undefined
    const label = `Open credit note ${note.creditNoteNumber}`
    return (
        <TableRow
            className="cursor-pointer"
            onClick={mode === ComponentMode.Dialog ? () => onSelect?.(note) : undefined}
        >
            <SearchResultCell primary to={path} linkLabel={label}>
                {note.creditNoteNumber}
            </SearchResultCell>
            <SearchResultCell to={path} linkLabel={label}>
                {note.customerName ?? note.customerCode ?? '—'}
            </SearchResultCell>
            <SearchResultCell to={path} linkLabel={label} className="text-right">
                {formatCurrency(note.amount ?? 0)}
            </SearchResultCell>
            <SearchResultCell to={path} linkLabel={label}>
                {formatDate(note.issueDate)}
            </SearchResultCell>
            <SearchResultCell to={path} linkLabel={label}>
                {formatDate(note.dueDate)}
            </SearchResultCell>
        </TableRow>
    )
}

function MessageRow({ children }: { children: React.ReactNode }) {
    return (
        <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {children}
            </TableCell>
        </TableRow>
    )
}
