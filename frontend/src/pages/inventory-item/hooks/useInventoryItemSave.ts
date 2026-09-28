import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { emptyToNull } from "@/lib/form-input";
import { isOptionalNonNegativeNumber, numberOrNull } from "@/lib/numbers";
import { toast } from "@/lib/toast";
import {
    fetchInventoryItemExists,
    fetchInventoryItemGoodsReceiptCount,
    postSaveInventoryItem,
} from "../inventory-item-api";
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
    const [goodsReceiptCountWarning, setGoodsReceiptCountWarning] = useState<
        number | null
    >(null);
    const [duplicateCodeWarning, setDuplicateCodeWarning] = useState(false);
    const canSave = Boolean(
        options.draft.productCode.trim() && options.draft.name.trim(),
    ) && isOptionalNonNegativeNumber(options.draft.minimumStockLevel) &&
        !options.isLoading && !options.isDuplicating && !options.loadError;

    const performSave = async () => {
        const isCreating = options.itemId == null;
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
        }
    };

    const saveInventoryItem = async () => {
        if (!canSave || isSaving) return false;
        setIsSaving(true);
        setSaveError(null);
        options.clearDuplicateError();
        try {
            if (options.itemId == null && await fetchInventoryItemExists(
                options.draft.productCode.trim(),
            )) {
                setDuplicateCodeWarning(true);
                return false;
            }
            if (options.itemId != null && options.routeProductCode) {
                const count = await fetchInventoryItemGoodsReceiptCount(
                    options.routeProductCode,
                );
                if (count > 0) {
                    setGoodsReceiptCountWarning(count);
                    return false;
                }
            }
            return await performSave();
        } catch (requestError: unknown) {
            setSaveError(
                requestError instanceof Error
                    ? requestError.message
                    : "Checking inventory item goods receipt usage failed",
            );
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const confirmSave = async () => {
        if (!canSave || isSaving) return false;
        setGoodsReceiptCountWarning(null);
        setIsSaving(true);
        setSaveError(null);
        options.clearDuplicateError();
        try {
            return await performSave();
        } finally {
            setIsSaving(false);
        }
    };

    return {
        canSave,
        saveInventoryItem,
        confirmSave,
        isSaving,
        saveError,
        setSaveError,
        goodsReceiptCountWarning,
        setGoodsReceiptCountWarning,
        duplicateCodeWarning,
        setDuplicateCodeWarning,
    };
}
