import { getSelectedBusinessYear } from "@/lib/business-year";
import { postGraphql } from "@/lib/graphql";
import type { InventoryItem } from "@/lib/inventory-item-types";
import type { GoodsReceiptItemPhoto } from "@/lib/goods-receipt-types";
import { nextPaddedNumber } from "@/lib/numbers";

const fields = "id productCode name unit minimumStockLevel";

export type InventoryItemStock = {
    storage: string | null;
    quantity: number;
};

export type InventoryItemPhotoSource = {
    photos: GoodsReceiptItemPhoto[];
};

export async function fetchLatestInventoryItemPhotos(
    productCode: string,
    signal?: AbortSignal,
): Promise<InventoryItemPhotoSource | null> {
    const result = await postGraphql<{
        data?: { latestInventoryItemPhotos: GoodsReceiptItemPhoto[] };
    }>(
        `query LatestInventoryItemPhotos(
            $businessYear: String!
            $productCode: String!
        ) {
            latestInventoryItemPhotos(
                businessYear: $businessYear
                productCode: $productCode
            ) { fileId }
        }`,
        { businessYear: getSelectedBusinessYear(), productCode },
        signal,
    );
    const photos = result.data?.latestInventoryItemPhotos ?? [];
    return photos.length > 0 ? { photos } : null;
}

export async function fetchInventoryItem(
    productCode: string,
    signal?: AbortSignal,
): Promise<InventoryItem> {
    const result = await postGraphql<{
        data?: { inventoryItem: InventoryItem | null };
    }>(
        `
        query InventoryItem($businessYear: String!, $productCode: String!) {
            inventoryItem(businessYear: $businessYear, productCode: $productCode) { ${fields} }
        }`,
        { businessYear: getSelectedBusinessYear(), productCode },
        signal,
    );
    if (!result.data?.inventoryItem)
        throw new Error(`Inventory item ${productCode} was not found`);
    return result.data.inventoryItem;
}

export async function fetchInventoryItemExists(productCode: string): Promise<boolean> {
    const result = await postGraphql<{
        data?: { inventoryItem: Pick<InventoryItem, "id"> | null };
    }>(
        `query InventoryItemExists($businessYear: String!, $productCode: String!) {
            inventoryItem(businessYear: $businessYear, productCode: $productCode) { id }
        }`,
        { businessYear: getSelectedBusinessYear(), productCode },
    );
    return result.data?.inventoryItem != null;
}

export async function fetchInventoryItemGoodsReceiptCount(
    productCode: string,
): Promise<number> {
    const result = await postGraphql<{
        data?: { searchGoodsReceipts: { totalCount: number } };
    }>(
        `query InventoryItemGoodsReceiptCount($businessYear: String!, $productCode: String!) {
            searchGoodsReceipts(
                businessYear: $businessYear
                productCode: $productCode
                page: 1
                pageSize: 1
            ) { totalCount }
        }`,
        { businessYear: getSelectedBusinessYear(), productCode },
    );
    return result.data?.searchGoodsReceipts.totalCount ?? 0;
}

export async function fetchInventoryItemStock(
    productCode: string,
    signal?: AbortSignal,
): Promise<InventoryItemStock[]> {
    const result = await postGraphql<{
        data?: {
            searchGoodsReceipts: {
                goodsReceipts: {
                    storage: string | null;
                    items: { productCode: string | null; quantity: number | null }[];
                }[];
            };
        };
    }>(
        `query InventoryItemStock($businessYear: String!, $productCode: String!) {
            searchGoodsReceipts(
                businessYear: $businessYear
                productCode: $productCode
                page: 1
                pageSize: 10000
            ) {
                goodsReceipts {
                    storage
                    items { productCode quantity }
                }
            }
        }`,
        { businessYear: getSelectedBusinessYear(), productCode },
        signal,
    );
    const quantities = new Map<string | null, number>();
    for (const receipt of result.data?.searchGoodsReceipts.goodsReceipts ?? []) {
        const quantity = receipt.items
            .filter((item) => item.productCode === productCode)
            .reduce((sum, item) => sum + (item.quantity ?? 0), 0);
        quantities.set(receipt.storage, (quantities.get(receipt.storage) ?? 0) + quantity);
    }
    return [...quantities.entries()]
        .map(([storage, quantity]) => ({ storage, quantity }))
        .sort((left, right) => (left.storage ?? "").localeCompare(right.storage ?? ""));
}

export async function fetchNextInventoryItemCode(
    signal?: AbortSignal,
): Promise<string> {
    const result = await postGraphql<{
        data?: {
            searchInventoryItems: {
                items: Pick<InventoryItem, "productCode">[];
            };
        };
    }>(
        `
        query LatestInventoryItem($businessYear: String!) {
            searchInventoryItems(businessYear: $businessYear, sortBy: "productCode", sortDirection: "desc", page: 1, pageSize: 1) {
                items { productCode }
            }
        }`,
        { businessYear: getSelectedBusinessYear() },
        signal,
    );
    return nextPaddedNumber(
        result.data?.searchInventoryItems.items[0]?.productCode,
        4,
    );
}

export async function postSaveInventoryItem(
    inventoryItem: Record<string, unknown>,
): Promise<InventoryItem> {
    const result = await postGraphql<{
        data?: { saveInventoryItem: InventoryItem };
    }>(
        `
        mutation SaveInventoryItem($businessYear: String!, $inventoryItem: InventoryItemInput!) {
            saveInventoryItem(businessYear: $businessYear, inventoryItem: $inventoryItem) { ${fields} }
        }`,
        { businessYear: getSelectedBusinessYear(), inventoryItem },
    );
    if (!result.data?.saveInventoryItem)
        throw new Error("Saving inventory item returned no inventory item");
    return result.data.saveInventoryItem;
}
