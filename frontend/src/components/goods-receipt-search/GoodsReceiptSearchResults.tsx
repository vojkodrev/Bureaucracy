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
import type { GoodsReceiptPage } from '@/lib/goods-receipt-types'
import GoodsReceiptSearchResultGroup from './GoodsReceiptSearchResultGroup'
import type { GoodsReceiptSearchCriteria, GoodsReceiptSortColumn } from './types'

type Props = {
    page: GoodsReceiptPage | null
    isLoading: boolean
    search: GoodsReceiptSearchCriteria
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: (column: GoodsReceiptSortColumn) => void
}

export default function GoodsReceiptSearchResults({
    page,
    isLoading,
    search,
    onPageChange,
    onPageSizeChange,
    onSort,
}: Props) {
    const first = page && page.totalCount > 0 ? (page.page - 1) * page.pageSize + 1 : 0
    const last = page ? Math.min(page.page * page.pageSize, page.totalCount) : 0
    return (
        <div className="mt-8 w-full overflow-x-auto">
            {page && (
                <Pager
                    firstItem={first}
                    lastItem={last}
                    page={page.page}
                    pageSize={page.pageSize}
                    totalItems={page.totalCount}
                    totalPages={page.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableTableHead
                            label="Goods receipt number"
                            direction={
                                search.sortBy === 'receiptNumber'
                                    ? search.sortDirection
                                    : ''
                            }
                            onSort={() => onSort('receiptNumber')}
                        />
                        <SortableTableHead
                            label="Date"
                            direction={
                                search.sortBy === 'receiptDate'
                                    ? search.sortDirection
                                    : ''
                            }
                            onSort={() => onSort('receiptDate')}
                        />
                        <SortableTableHead
                            label="Received by"
                            direction={
                                search.sortBy === 'receivedBy'
                                    ? search.sortDirection
                                    : ''
                            }
                            onSort={() => onSort('receivedBy')}
                        />
                        <TableHead className="text-right">Products / quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading goods receipts…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && !page?.goodsReceipts.length && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No goods receipts found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && page?.goodsReceipts.map((receipt) => (
                        <GoodsReceiptSearchResultGroup
                            key={receipt.id}
                            receipt={receipt}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
