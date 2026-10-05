import SearchResultCell from '@/components/SearchResultCell'
import Pager from "@/components/Pager";
import SortableTableHead from "@/components/SortableTableHead";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type {
    InventoryItem,
    InventoryItemPage,
} from "@/lib/inventory-item-types";
import { ComponentMode } from "@/lib/component-mode";
import { inventoryItemSortColumns } from "./inventory-item-search-columns";
import type {
    InventoryItemSearchCriteria,
    InventoryItemSortColumn,
} from "./types";

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

export default function InventoryItemSearchResults({
    search,
    itemPage,
    items,
    isLoading,
    mode,
    showSearchFields,
    onPageChange,
    onPageSizeChange,
    onSort,
    onInventoryItemSelect,
}: Props) {
    const firstItem =
        itemPage && itemPage.totalCount > 0
            ? (itemPage.page - 1) * itemPage.pageSize + 1
            : 0;
    const lastItem = itemPage
        ? Math.min(itemPage.page * itemPage.pageSize, itemPage.totalCount)
        : 0;
    const isPageMode = mode === ComponentMode.Page;

    return (
        <div className={showSearchFields ? "mt-8" : undefined}>
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
            <Table aria-busy={isLoading}>
                <TableHeader>
                    <TableRow>
                        {inventoryItemSortColumns.map(
                            ({ key, label, alignRight }) => (
                                <SortableTableHead
                                    key={key}
                                    label={label}
                                    direction={
                                        search.sortBy === key
                                            ? search.sortDirection
                                            : ""
                                    }
                                    alignRight={alignRight}
                                    onSort={() => onSort(key)}
                                />
                            ),
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && !items.length && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading inventory items…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && items.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No inventory items found.
                            </TableCell>
                        </TableRow>
                    )}
                    {items.map((item) => (
                            <TableRow
                                key={item.id}
                                className="cursor-pointer"
                                tabIndex={isPageMode ? undefined : 0}
                                onClick={isPageMode ? undefined : () => onInventoryItemSelect?.(item)}
                                onKeyDown={isPageMode ? undefined : (event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onInventoryItemSelect?.(item);
                                    }
                                }}
                            >
                                <SearchResultCell
                                    primary
                                    to={isPageMode && item.productCode ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined}
                                    linkLabel={`Open inventory item ${item.productCode}`}
                                    className="font-medium"
                                >
                                    {item.productCode ?? "—"}
                                </SearchResultCell>
                                <SearchResultCell
                                    to={isPageMode && item.productCode ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined}
                                    linkLabel={`Open inventory item ${item.productCode}`}
                                >{item.name ?? "—"}</SearchResultCell>
                                <SearchResultCell
                                    to={isPageMode && item.productCode ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined}
                                    linkLabel={`Open inventory item ${item.productCode}`}
                                >{item.unit ?? "—"}</SearchResultCell>
                                <SearchResultCell
                                    to={isPageMode && item.productCode ? `/inventory-item/${encodeURIComponent(item.productCode)}` : undefined}
                                    linkLabel={`Open inventory item ${item.productCode}`}
                                    className="text-right tabular-nums"
                                >
                                    {item.minimumStockLevel?.toLocaleString(
                                        "en-IE",
                                    ) ?? "—"}
                                </SearchResultCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
