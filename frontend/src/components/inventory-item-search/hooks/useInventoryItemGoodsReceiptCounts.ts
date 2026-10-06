import { useEffect, useMemo, useState } from "react";
import type { InventoryItemPage } from "@/lib/inventory-item-types";
import { fetchInventoryItemGoodsReceiptCounts } from "../inventory-item-search-api";

type GoodsReceiptCountResult = {
    key: string;
    counts: Record<string, number>;
    error: boolean;
};

export function useInventoryItemGoodsReceiptCounts(
    enabled: boolean,
    itemPage: InventoryItemPage | null,
    searchKey: string,
) {
    const productCodes = useMemo(
        () =>
            itemPage?.items.flatMap(({ productCode }) =>
                productCode ? [productCode] : [],
            ) ?? [],
        [itemPage],
    );
    const requestKey =
        enabled && itemPage
            ? `${searchKey}:${productCodes.join(",")}`
            : "__disabled__";
    const [result, setResult] = useState<GoodsReceiptCountResult>({
        key: "__initial__",
        counts: {},
        error: false,
    });
    const hasProductCodes = productCodes.length > 0;
    const isLoading =
        enabled &&
        itemPage != null &&
        hasProductCodes &&
        result.key !== requestKey;

    useEffect(() => {
        if (!enabled || !itemPage || productCodes.length === 0) return;

        const controller = new AbortController();
        void fetchInventoryItemGoodsReceiptCounts(
            productCodes,
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
    }, [enabled, itemPage, productCodes, requestKey]);

    return {
        counts: hasProductCodes ? result.counts : {},
        isLoading,
        error: hasProductCodes && result.error,
    };
}
