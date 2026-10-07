import SearchResultCell from "@/components/SearchResultCell";
import Pager from "@/components/Pager";
import SortableTableHead from "@/components/SortableTableHead";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComponentMode } from "@/lib/component-mode";
import type { InventoryItem, InventoryItemPage } from "@/lib/inventory-item-types";
import { TriangleAlert } from "lucide-react";
import { inventoryItemSortColumns } from "./inventory-item-search-columns";
import type { InventoryItemSearchCriteria, InventoryItemSortColumn } from "./types";

type Props = {
    search: InventoryItemSearchCriteria;
    itemPage: InventoryItemPage | null;
    items: InventoryItem[];
    isLoading: boolean;
    mode: ComponentMode;
    showSearchFields: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSort: (sortBy: InventoryItemSortColumn) => void;
    onInventoryItemSelect?: (item: InventoryItem) => void;
};

export default function InventoryItemLowStockResults({
    search, itemPage, items, isLoading, mode, showSearchFields,
    onPageChange, onPageSizeChange, onSort, onInventoryItemSelect,
}: Props) {
    const isPageMode = mode === ComponentMode.Page;
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
                <TableHead className="text-right">Current stock</TableHead>
                <TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
                {isLoading && !items.length && <EmptyRow>Loading low-stock items…</EmptyRow>}
                {!isLoading && !items.length && <EmptyRow>No low-stock items found.</EmptyRow>}
                {items.map((item) => {
                    const to = isPageMode && item.productCode
                        ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined;
                    const label = `Open inventory item ${item.productCode}`;
                    const currentStock = item.currentStock ?? 0;
                    const minimumStock = item.minimumStockLevel ?? 0;
                    const status = currentStock < minimumStock ? "Below minimum"
                        : currentStock === minimumStock ? "At minimum" : "Near minimum";
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
                            <SearchResultCell to={to} linkLabel={label} className="text-right tabular-nums">{minimumStock.toLocaleString("en-IE")}</SearchResultCell>
                            <SearchResultCell to={to} linkLabel={label} className="text-right tabular-nums">{currentStock.toLocaleString("en-IE")}</SearchResultCell>
                            <SearchResultCell to={to} linkLabel={label}>
                                <Alert
                                    variant={currentStock < minimumStock ? "destructive" : "warning"}
                                    className="w-fit min-w-36 whitespace-nowrap px-2 py-1"
                                >
                                    <TriangleAlert aria-hidden="true" />
                                    <AlertTitle>{status}</AlertTitle>
                                </Alert>
                            </SearchResultCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        </div>
    );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
    return <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">{children}</TableCell></TableRow>;
}
