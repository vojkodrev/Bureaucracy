import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { emptyToNull } from "@/lib/form-input";
import { isOptionalNonNegativeNumber, numberOrNull } from "@/lib/numbers";
import { toast } from "@/lib/toast";
import { postSaveInventoryItem } from "../inventory-item-api";
import {
    inventoryItemDraft,
    type InventoryItemDraft,
} from "./useInventoryItemDraft";

type Options = {
    itemId: number | null;
    draft: InventoryItemDraft;
    routeProductCode?: string;
    isLoading: boolean;
    loadError: string | null;
    isDuplicating: boolean;
    navigate: NavigateFunction;
    replaceDraft: (draft: InventoryItemDraft) => void;
    markClean: (draft: InventoryItemDraft) => void;
    setItemId: (id: number | null) => void;
    clearDuplicateError: () => void;
    allowNavigation: () => void;
    reloadAfterSave: () => void;
};

export function useInventoryItemSave(options: Options) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const canSave = Boolean(
        options.draft.productCode.trim() && options.draft.name.trim(),
    ) && isOptionalNonNegativeNumber(options.draft.minimumStockLevel) &&
        !options.isLoading && !options.isDuplicating && !options.loadError;

    const saveInventoryItem = async () => {
        if (!canSave || isSaving) return false;
        const isCreating = options.itemId == null;
        setIsSaving(true);
        setSaveError(null);
        options.clearDuplicateError();
        try {
            const saved = await postSaveInventoryItem({
                id: options.itemId,
                productCode: options.draft.productCode.trim(),
                name: emptyToNull(options.draft.name),
                unit: emptyToNull(options.draft.unit),
                minimumStockLevel: numberOrNull(
                    options.draft.minimumStockLevel,
                ),
            });
            const savedDraft = inventoryItemDraft(saved);
            options.setItemId(saved.id);
            options.replaceDraft(savedDraft);
            options.markClean(savedDraft);
            toast.add({
                title: "Inventory item saved",
                description: `${saved.productCode} was ${isCreating ? "created" : "updated"} successfully.`,
                type: "success",
            });
            if (options.routeProductCode === saved.productCode) {
                options.reloadAfterSave();
            } else {
                options.allowNavigation();
                options.navigate(
                    `/inventory-item/${encodeURIComponent(saved.productCode ?? "")}`,
                );
            }
            return true;
        } catch (requestError: unknown) {
            setSaveError(
                requestError instanceof Error
                    ? requestError.message
                    : "Saving inventory item failed",
            );
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        canSave,
        saveInventoryItem,
        isSaving,
        saveError,
        setSaveError,
    };
}
