import { useEffect, useMemo, useState } from "react";
import type { InventoryItemPage } from "@/lib/inventory-item-types";
import { fetchInventoryItemGoodsReceiptCounts } from "../inventory-item-search-api";

type GoodsReceiptCountResult = {
    key: string;
    counts: Record<string, number>;
    error: boolean;
};

export function useInventoryItemGoodsReceiptCounts(
    itemPage: InventoryItemPage | null,
    searchKey: string,
) {
    const inventoryItemCodes = useMemo(
        () =>
            itemPage?.items.flatMap(({ productCode }) =>
                productCode ? [productCode] : [],
            ) ?? [],
        [itemPage],
    );
    const requestKey = itemPage
        ? `${searchKey}:${inventoryItemCodes.join(",")}`
        : "__initial__";
    const [result, setResult] = useState<GoodsReceiptCountResult>({
        key: "__initial__",
        counts: {},
        error: false,
    });
    const hasInventoryItemCodes = inventoryItemCodes.length > 0;
    const isLoading =
        itemPage != null &&
        hasInventoryItemCodes &&
        result.key !== requestKey;

    useEffect(() => {
        if (!itemPage || inventoryItemCodes.length === 0) return;

        const controller = new AbortController();
        void fetchInventoryItemGoodsReceiptCounts(
            inventoryItemCodes,
            controller.signal,
        )
            .then((counts) =>
                setResult({ key: requestKey, counts, error: false }),
            )
            .catch((requestError: unknown) => {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === "AbortError"
                )
                    return;
                setResult({ key: requestKey, counts: {}, error: true });
            });
        return () => controller.abort();
    }, [itemPage, inventoryItemCodes, requestKey]);

    return {
        counts: hasInventoryItemCodes ? result.counts : {},
        isLoading,
        error: hasInventoryItemCodes && result.error,
    };
}
