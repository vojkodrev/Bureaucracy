import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { toast } from "@/lib/toast";
import { fetchNextInventoryItemCode } from "../inventory-item-api";
import type { InventoryItemDraft } from "./useInventoryItemDraft";

type Options = {
    itemId: number | null;
    hasUnsavedChanges: boolean;
    navigate: NavigateFunction;
    setItemId: (id: number | null) => void;
    replaceDraft: React.Dispatch<React.SetStateAction<InventoryItemDraft>>;
    markUnsaved: () => void;
    preserveDuplicateDraft: () => void;
    allowNavigation: () => void;
};

export function useInventoryItemDuplicate(options: Options) {
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const performDuplicate = async () => {
        if (options.itemId == null || isDuplicating) return;
        setConfirmingDuplicate(false);
        setIsDuplicating(true);
        setDuplicateError(null);
        try {
            const productCode = await fetchNextInventoryItemCode();
            options.setItemId(null);
            options.replaceDraft((current) => ({
                ...current,
                productCode,
            }));
            options.markUnsaved();
            options.preserveDuplicateDraft();
            options.allowNavigation();
            options.navigate("/inventory-item");
            toast.add({
                title: "Inventory item duplicated",
                description:
                    `Product code ${productCode} has been assigned to the ` +
                    "new unsaved copy.",
                type: "info",
            });
        } catch (requestError: unknown) {
            setDuplicateError(
                requestError instanceof Error
                    ? requestError.message
                    : "Duplicating inventory item failed",
            );
        } finally {
            setIsDuplicating(false);
        }
    };

    const duplicate = async () => {
        if (options.itemId == null || isDuplicating) return;
        if (options.hasUnsavedChanges) {
            setConfirmingDuplicate(true);
            return;
        }
        await performDuplicate();
    };

    return {
        duplicate,
        performDuplicate,
        isDuplicating,
        confirmingDuplicate,
        setConfirmingDuplicate,
        duplicateError,
        setDuplicateError,
    };
}
