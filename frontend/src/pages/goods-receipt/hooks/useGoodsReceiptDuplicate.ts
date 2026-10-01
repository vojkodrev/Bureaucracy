import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import {
    getSelectedBusinessYear,
    setSelectedBusinessYear,
} from "@/lib/business-year";
import { fetchCurrentBusinessYear } from "@/lib/business-year-api";
import { toast } from "@/lib/toast";
import { fetchNextGoodsReceiptNumber } from "../goods-receipt-api";
import type { GoodsReceiptDraft } from "./useGoodsReceiptDraft";

type Options = {
    receiptId: number | null;
    draft: GoodsReceiptDraft;
    hasUnsavedChanges: boolean;
    navigate: NavigateFunction;
    replaceDraft: (draft: GoodsReceiptDraft) => void;
    markUnsaved: () => void;
    setReceiptId: (id: number | null) => void;
    preserveDuplicateDraft: () => void;
    allowNavigation: () => void;
};

export function useGoodsReceiptDuplicate(options: Options) {
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);

    const performDuplicate = async () => {
        if (options.receiptId == null || isDuplicating) return;
        setConfirmingDuplicate(false);
        setIsDuplicating(true);
        setDuplicateError(null);
        try {
            const currentYear = await fetchCurrentBusinessYear();
            const receiptNumber = await fetchNextGoodsReceiptNumber(
                undefined,
                currentYear.code,
            );
            if (currentYear.code !== getSelectedBusinessYear()) {
                setSelectedBusinessYear(currentYear.code);
            }
            const duplicateDraft: GoodsReceiptDraft = {
                ...options.draft,
                receiptNumber,
                receiptDate: new Date(),
                items: options.draft.items.map((item, index) => ({
                    ...item,
                    id: -index - 1,
                    photos: [],
                })),
            };
            options.setReceiptId(null);
            options.replaceDraft(duplicateDraft);
            options.markUnsaved();
            options.preserveDuplicateDraft();
            options.allowNavigation();
            options.navigate("/goods-receipt");
            toast.add({
                title: "Goods receipt duplicated",
                description:
                    `Receipt number ${receiptNumber} has been assigned to ` +
                    "the new unsaved copy. Review it before saving.",
                type: "info",
            });
        } catch (error) {
            setDuplicateError(error instanceof Error
                ? error.message
                : "Duplicating goods receipt failed");
        } finally {
            setIsDuplicating(false);
        }
    };

    const duplicate = async () => {
        if (options.receiptId == null || isDuplicating) return;
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
