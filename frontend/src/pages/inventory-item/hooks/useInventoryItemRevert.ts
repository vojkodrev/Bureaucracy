import { useState } from "react";
import { toast } from "@/lib/toast";
import {
    inventoryItemDraft,
    type InventoryItemDraft,
} from "./useInventoryItemDraft";

type Options = {
    routeInventoryItemCode?: string;
    hasUnsavedChanges: boolean;
    isDuplicating: boolean;
    clearSaveError: () => void;
    clearDuplicateError: () => void;
    replaceDraft: (draft: InventoryItemDraft) => void;
    markClean: (draft: InventoryItemDraft) => void;
    reload: () => void;
};

export function useInventoryItemRevert(options: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false);
    const canRevert = options.hasUnsavedChanges && !options.isDuplicating;

    const performRevert = () => {
        setConfirmingRevert(false);
        options.clearSaveError();
        options.clearDuplicateError();
        if (options.routeInventoryItemCode) {
            options.reload();
        } else {
            const emptyDraft = inventoryItemDraft();
            options.replaceDraft(emptyDraft);
            options.markClean(emptyDraft);
        }
        toast.add({
            title: "Inventory item reverted",
            description: options.routeInventoryItemCode
                ? `${options.routeInventoryItemCode} was restored to its last saved version.`
                : "The new inventory item form was cleared.",
            type: "success",
        });
    };

    return {
        canRevert,
        confirmingRevert,
        setConfirmingRevert,
        requestRevert: () => {
            if (canRevert) setConfirmingRevert(true);
        },
        performRevert,
    };
}
