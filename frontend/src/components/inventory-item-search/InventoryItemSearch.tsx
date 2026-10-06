import ErrorAlert from "@/components/ErrorAlert";
import { ComponentMode } from "@/lib/component-mode";
import type { InventoryItem } from "@/lib/inventory-item-types";
import { useInventoryItemGoodsReceiptCounts } from "./hooks/useInventoryItemGoodsReceiptCounts";
import { useInventoryItemSearchResults } from "./hooks/useInventoryItemSearchResults";
import { useInventoryItemSearchState } from "./hooks/useInventoryItemSearchState";
import InventoryItemSearchForm from "./InventoryItemSearchForm";
import InventoryItemSearchResults from "./InventoryItemSearchResults";

type InventoryItemSearchProps = {
    mode: ComponentMode;
    showSearchFields?: boolean;
    similarName?: string;
    showGoodsReceiptCount?: boolean;
    onInventoryItemSelect?: (item: InventoryItem) => void;
};

export default function InventoryItemSearch({
    mode,
    showSearchFields = true,
    similarName,
    showGoodsReceiptCount = false,
    onInventoryItemSelect,
}: InventoryItemSearchProps) {
    const searchState = useInventoryItemSearchState(mode, similarName);
    const { search, searchKey } = searchState;
    const { itemPage, items, isLoading, error } = useInventoryItemSearchResults(
        search,
        searchKey,
        similarName,
    );
    const goodsReceiptCounts = useInventoryItemGoodsReceiptCounts(
        showGoodsReceiptCount,
        itemPage,
        searchKey,
    );

    return (
        <div className="p-4">
            {error && (
                <div className="mb-6 max-w-2xl">
                    <ErrorAlert
                        title="Inventory items could not be loaded"
                        description="The inventory item search could not be completed."
                        error={error}
                    />
                </div>
            )}
            {showSearchFields && (
                <InventoryItemSearchForm
                    key={searchKey}
                    search={search}
                    onSubmit={searchState.updateSearch}
                    onReset={searchState.clearSearch}
                />
            )}
            {!error && (
                <InventoryItemSearchResults
                    search={search}
                    itemPage={itemPage}
                    items={items}
                    isLoading={isLoading}
                    mode={mode}
                    showSearchFields={showSearchFields}
                    showGoodsReceiptCount={showGoodsReceiptCount}
                    goodsReceiptCounts={goodsReceiptCounts.counts}
                    goodsReceiptCountsLoading={goodsReceiptCounts.isLoading}
                    goodsReceiptCountsError={goodsReceiptCounts.error}
                    onPageChange={(page) =>
                        searchState.changePage(page, itemPage?.pageSize)
                    }
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                    onInventoryItemSelect={onInventoryItemSelect}
                />
            )}
        </div>
    );
}
