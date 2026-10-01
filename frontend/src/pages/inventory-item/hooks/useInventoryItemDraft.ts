import { useMemo, useState } from "react";
import type { InventoryItem } from "@/lib/inventory-item-types";

export type InventoryItemDraft = {
    productCode: string;
    name: string;
    unit: string;
    minimumStockLevel: string;
};
export function inventoryItemDraft(
    item?: InventoryItem | null,
): InventoryItemDraft {
    return {
        productCode: item?.productCode ?? "",
        name: item?.name ?? "",
        unit: item?.unit ?? "",
        minimumStockLevel:
            item?.minimumStockLevel == null
                ? ""
                : String(item.minimumStockLevel),
    };
}
export function useInventoryItemDraft() {
    const [draft, setDraft] = useState<InventoryItemDraft>(inventoryItemDraft);
    const [cleanDraft, setCleanDraft] = useState(() =>
        JSON.stringify(inventoryItemDraft()),
    );
    const serialized = useMemo(() => JSON.stringify(draft), [draft]);
    return {
        draft,
        setDraft,
        setField: <K extends keyof InventoryItemDraft>(
            field: K,
            value: InventoryItemDraft[K],
        ) => setDraft((current) => ({ ...current, [field]: value })),
        markClean: (value: InventoryItemDraft = draft) =>
            setCleanDraft(JSON.stringify(value)),
        markUnsaved: () => setCleanDraft("__unsaved__"),
        hasUnsavedChanges: serialized !== cleanDraft,
    };
}
