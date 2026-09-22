import { getSelectedBusinessYear } from "@/lib/business-year";
import { postGraphql } from "@/lib/graphql";
import type { InventoryItem } from "@/lib/inventory-item-types";
import { nextPaddedNumber } from "@/lib/numbers";

const fields = "id productCode name unit minimumStockLevel";

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
