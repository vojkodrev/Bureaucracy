import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { toast } from "@/lib/toast";
import { saveGoodsReceipt } from "../goods-receipt-api";
import {
    goodsReceiptDraft,
    type GoodsReceiptDraft,
} from "./useGoodsReceiptDraft";

type Options = {
    receiptId: number | null;
    draft: GoodsReceiptDraft;
    routeReceiptNumber?: string;
    isLoading: boolean;
    loadError: string | null;
    navigate: NavigateFunction;
    replaceDraft: (draft: GoodsReceiptDraft) => void;
    markClean: (draft: GoodsReceiptDraft) => void;
    setReceiptId: (id: number | null) => void;
    allowNavigation: () => void;
    reload: () => void;
};

export function useGoodsReceiptSave(options: Options) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const hasValidItems = options.draft.items.length > 0 &&
        options.draft.items.every((item) =>
            Boolean(item.productCode?.trim()) &&
            item.quantity != null &&
            item.quantity > 0,
        );
    const canSave = Boolean(
        options.draft.receiptNumber.trim() &&
        options.draft.receiptDate &&
        options.draft.storage.trim() &&
        options.draft.receivedBy.trim() &&
        hasValidItems,
    ) && !options.isLoading && !options.loadError;

    const save = async () => {
        if (!canSave || isSaving) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const saved = await saveGoodsReceipt({
                id: options.receiptId,
                receiptNumber: options.draft.receiptNumber.trim(),
                receiptDate: `${options.draft.receiptDate}T00:00:00Z`,
                storage: options.draft.storage.trim(),
                receivedBy: options.draft.receivedBy.trim(),
                items: options.draft.items.map((item) => ({
                    id: item.id > 0 ? item.id : null,
                    productCode: item.productCode?.trim(),
                    productName: item.productName,
                    unit: item.unit,
                    quantity: item.quantity,
                })),
            });
            const next = goodsReceiptDraft(saved);
            options.setReceiptId(saved.id);
            options.replaceDraft(next);
            options.markClean(next);
            toast.add({
                title: "Goods receipt saved",
                description:
                    `Goods receipt ${saved.receiptNumber} was saved successfully.`,
                type: "success",
            });
            if (options.routeReceiptNumber === saved.receiptNumber) {
                options.reload();
            } else {
                options.allowNavigation();
                options.navigate(
                    `/goods-receipt/${encodeURIComponent(saved.receiptNumber)}`,
                );
            }
        } catch (error) {
            setSaveError(error instanceof Error
                ? error.message
                : "Saving goods receipt failed");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        canSave,
        isSaving,
        saveError,
        setSaveError,
        save,
    };
}
