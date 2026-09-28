import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { nextPaddedNumber } from "@/lib/numbers";
import { dateForApi } from "@/lib/dates";
import { toast } from "@/lib/toast";
import type { GoodsReceiptNumberWarning } from
    "../GoodsReceiptNumberAlert";
import {
    fetchGoodsReceiptExists,
    fetchLatestGoodsReceiptNumber,
    saveGoodsReceipt,
} from "../goods-receipt-api";
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
    isDuplicating: boolean;
    navigate: NavigateFunction;
    replaceDraft: (draft: GoodsReceiptDraft) => void;
    markClean: (draft: GoodsReceiptDraft) => void;
    setReceiptId: (id: number | null) => void;
    allowNavigation: () => void;
    reload: () => void;
    clearDuplicateError: () => void;
};

export function useGoodsReceiptSave(options: Options) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [numberWarning, setNumberWarning] =
        useState<GoodsReceiptNumberWarning | null>(null);
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
    ) && !options.isLoading && !options.isDuplicating && !options.loadError;

    const performSave = async () => {
        try {
            const saved = await saveGoodsReceipt({
                id: options.receiptId,
                receiptNumber: options.draft.receiptNumber.trim(),
                receiptDate: dateForApi(options.draft.receiptDate),
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
            return true;
        } catch (error) {
            setSaveError(error instanceof Error
                ? error.message
                : "Saving goods receipt failed");
            return false;
        }
    };

    const requestSave = async () => {
        if (!canSave || isSaving) return false;
        setIsSaving(true);
        setSaveError(null);
        options.clearDuplicateError();
        try {
            const number = options.draft.receiptNumber.trim();
            if (options.receiptId == null &&
                await fetchGoodsReceiptExists(number)) {
                setNumberWarning({ kind: "duplicate" });
                return false;
            }
            const latest = await fetchLatestGoodsReceiptNumber();
            const next = nextPaddedNumber(latest, 5);
            if (number !== latest && number !== next) {
                const numberValue = Number.parseInt(number, 10);
                const nextValue = Number.parseInt(next, 10);
                setNumberWarning({
                    kind: numberValue > nextValue
                        ? "skipped"
                        : "historical",
                    latestReceiptNumber: latest,
                });
                return false;
            }
            return await performSave();
        } catch (error) {
            setSaveError(error instanceof Error
                ? error.message
                : "Checking latest goods receipt failed");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const confirmSave = async () => {
        if (!canSave || isSaving) return false;
        setNumberWarning(null);
        setIsSaving(true);
        setSaveError(null);
        try {
            return await performSave();
        } finally {
            setIsSaving(false);
        }
    };

    return {
        canSave,
        isSaving,
        saveError,
        setSaveError,
        requestSave,
        confirmSave,
        numberWarning,
        setNumberWarning,
    };
}
