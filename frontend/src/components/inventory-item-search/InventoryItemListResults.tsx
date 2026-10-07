import SearchResultCell from "@/components/SearchResultCell";
import Pager from "@/components/Pager";
import SortableTableHead from "@/components/SortableTableHead";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComponentMode } from "@/lib/component-mode";
import type { InventoryItem, InventoryItemPage } from "@/lib/inventory-item-types";
import { inventoryItemSortColumns } from "./inventory-item-search-columns";
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from "./types";

type Props = {
    search: InventoryItemSearchCriteria;
    itemPage: InventoryItemPage | null;
    items: InventoryItem[];
    isLoading: boolean;
    mode: ComponentMode;
    showSearchFields: boolean;
    showGoodsReceiptCount: boolean;
    goodsReceiptCounts: Record<string, number>;
    goodsReceiptCountsLoading: boolean;
    goodsReceiptCountsError: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSort: (sortBy: InventoryItemSortColumn) => void;
    onInventoryItemSelect?: (item: InventoryItem) => void;
};

export default function InventoryItemListResults({
    search, itemPage, items, isLoading, mode, showSearchFields, showGoodsReceiptCount,
    goodsReceiptCounts, goodsReceiptCountsLoading, goodsReceiptCountsError,
    onPageChange, onPageSizeChange, onSort, onInventoryItemSelect,
}: Props) {
    const isPageMode = mode === ComponentMode.Page;
    const columnCount = inventoryItemSortColumns.length + (showGoodsReceiptCount ? 1 : 0);
    const firstItem = itemPage && itemPage.totalCount > 0
        ? (itemPage.page - 1) * itemPage.pageSize + 1 : 0;
    const lastItem = itemPage
        ? Math.min(itemPage.page * itemPage.pageSize, itemPage.totalCount) : 0;

    return (
        <div className={showSearchFields ? "mt-8" : undefined}>
            {itemPage && (
                <Pager firstItem={firstItem} lastItem={lastItem} page={itemPage.page}
                    pageSize={itemPage.pageSize} totalItems={itemPage.totalCount}
                    totalPages={itemPage.totalPages} onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange} />
            )}
            <Table aria-busy={isLoading}>
            <TableHeader><TableRow>
                {inventoryItemSortColumns.map(({ key, label, alignRight }) => (
                    <SortableTableHead key={key} label={label}
                        direction={search.sortBy === key ? search.sortDirection : ""}
                        alignRight={alignRight} onSort={() => onSort(key)} />
                ))}
                {showGoodsReceiptCount && <TableHead className="text-right">Goods receipts</TableHead>}
            </TableRow></TableHeader>
            <TableBody>
                {isLoading && !items.length && <EmptyRow columns={columnCount}>Loading inventory items…</EmptyRow>}
                {!isLoading && !items.length && <EmptyRow columns={columnCount}>No inventory items found.</EmptyRow>}
                {items.map((item) => {
                    const to = isPageMode && item.productCode
                        ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined;
                    const label = `Open inventory item ${item.productCode}`;
                    return (
                        <TableRow key={item.id} className="cursor-pointer"
                            tabIndex={isPageMode ? undefined : 0}
                            onClick={isPageMode ? undefined : () => onInventoryItemSelect?.(item)}
                            onKeyDown={isPageMode ? undefined : (event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onInventoryItemSelect?.(item);
                                }
                            }}>
                            <SearchResultCell primary to={to} linkLabel={label} className="font-medium">{item.productCode ?? "—"}</SearchResultCell>
                            <SearchResultCell to={to} linkLabel={label}>{item.name ?? "—"}</SearchResultCell>
                            <SearchResultCell to={to} linkLabel={label}>{item.unit ?? "—"}</SearchResultCell>
                            <SearchResultCell to={to} linkLabel={label} className="text-right tabular-nums">{item.minimumStockLevel?.toLocaleString("en-IE") ?? "—"}</SearchResultCell>
                            {showGoodsReceiptCount && (
                                <SearchResultCell to={to} linkLabel={label} className="text-right tabular-nums">
                                    {goodsReceiptCountsLoading ? "…" : goodsReceiptCountsError ? "—"
                                        : item.productCode ? goodsReceiptCounts[item.productCode] ?? 0 : 0}
                                </SearchResultCell>
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </div>
    );
}

function EmptyRow({ columns, children }: { columns: number; children: React.ReactNode }) {
    return <TableRow><TableCell colSpan={columns} className="h-24 text-center text-muted-foreground">{children}</TableCell></TableRow>;
}
