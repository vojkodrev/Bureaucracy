import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { BankStatementEntry, BankStatementPage } from '@/lib/bank-statement-types'
import BankStatementSearchResultGroup from './BankStatementSearchResultGroup'
import type { BankStatementSearchCriteria } from './types'

type BankStatementSearchResultsProps = {
    statementPage: BankStatementPage | null
    groups: BankStatementEntry[][]
    isLoading: boolean
    search: BankStatementSearchCriteria
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: () => void
}

function BankStatementSearchResults({
    statementPage,
    groups,
    isLoading,
    search,
    onPageChange,
    onPageSizeChange,
    onSort,
}: BankStatementSearchResultsProps) {
    const firstStatement = statementPage && statementPage.totalCount > 0
        ? (statementPage.page - 1) * statementPage.pageSize + 1
        : 0
    const lastStatement = statementPage
        ? Math.min(statementPage.page * statementPage.pageSize, statementPage.totalCount)
        : 0

    return (
        <div className="mt-8 w-full overflow-x-auto">
            {statementPage && (
                <Pager
                    firstItem={firstStatement}
                    lastItem={lastStatement}
                    page={statementPage.page}
                    pageSize={statementPage.pageSize}
                    totalItems={statementPage.totalCount}
                    totalPages={statementPage.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableTableHead
                            label="Date"
                            direction={search.sortBy === 'date' ? search.sortDirection : ''}
                            onSort={onSort}
                        />
                        <TableHead>Counterparty</TableHead>
                        <TableHead>Transaction type</TableHead>
                        <TableHead className="text-right">Outflow</TableHead>
                        <TableHead className="text-right">Inflow</TableHead>
                        <TableHead>Document number</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Loading bank statements…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && groups.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No bank statements found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && groups.map((entries) => (
                        <BankStatementSearchResultGroup
                            key={entries[0].statementId}
                            entries={entries}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default BankStatementSearchResults
