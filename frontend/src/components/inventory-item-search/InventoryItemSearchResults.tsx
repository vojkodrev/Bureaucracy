import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from '@/components/ui/table'
import type { InventoryItem, InventoryItemPage } from '@/lib/inventory-item-types'
import { inventoryItemSortColumns } from './inventory-item-search-columns'
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from './types'

type Props = {
    search: InventoryItemSearchCriteria
    itemPage: InventoryItemPage | null
    items: InventoryItem[]
    isLoading: boolean
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: (sortBy: InventoryItemSortColumn) => void
}

export default function InventoryItemSearchResults({
    search, itemPage, items, isLoading, onPageChange, onPageSizeChange, onSort,
}: Props) {
    const firstItem = itemPage && itemPage.totalCount > 0
        ? (itemPage.page - 1) * itemPage.pageSize + 1
        : 0
    const lastItem = itemPage
        ? Math.min(itemPage.page * itemPage.pageSize, itemPage.totalCount)
        : 0

    return (
        <div className="mt-8">
            {itemPage && (
                <Pager
                    firstItem={firstItem}
                    lastItem={lastItem}
                    page={itemPage.page}
                    pageSize={itemPage.pageSize}
                    totalItems={itemPage.totalCount}
                    totalPages={itemPage.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        {inventoryItemSortColumns.map(({ key, label, alignRight }) => (
                            <SortableTableHead
                                key={key}
                                label={label}
                                direction={search.sortBy === key ? search.sortDirection : ''}
                                alignRight={alignRight}
                                onSort={() => onSort(key)}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Loading inventory items…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No inventory items found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.productCode ?? '—'}</TableCell>
                            <TableCell>{item.name ?? '—'}</TableCell>
                            <TableCell>{item.unit ?? '—'}</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {item.minimumStockLevel?.toLocaleString('en-IE') ?? '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
