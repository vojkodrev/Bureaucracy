import { Link } from "react-router-dom";
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
            <Table>
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
                    {isLoading && (
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
                    {!isLoading &&
                        items.map((item) => (
                            <TableRow
                                key={item.id}
                                className="relative cursor-pointer"
                                tabIndex={isPageMode ? undefined : 0}
                                onClick={isPageMode ? undefined : () => onInventoryItemSelect?.(item)}
                                onKeyDown={isPageMode ? undefined : (event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onInventoryItemSelect?.(item);
                                    }
                                }}
                            >
                                <TableCell className="font-medium">
                                    {isPageMode &&
                                        item.productCode && (
                                            <Link
                                                to={`/inventory-item/${encodeURIComponent(item.productCode)}`}
                                                aria-label={`Open inventory item ${item.productCode}`}
                                                className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                                            />
                                        )}
                                    {item.productCode ?? "—"}
                                </TableCell>
                                <TableCell>{item.name ?? "—"}</TableCell>
                                <TableCell>{item.unit ?? "—"}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {item.minimumStockLevel?.toLocaleString(
                                        "en-IE",
                                    ) ?? "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
