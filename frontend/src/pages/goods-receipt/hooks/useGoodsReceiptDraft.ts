import { useMemo, useState } from "react";
import type {
    GoodsReceipt,
    GoodsReceiptItem,
} from "@/lib/goods-receipt-types";
import { dateFromSearchValue } from "@/lib/dates";

export type GoodsReceiptDraft = {
    receiptNumber: string;
    receiptDate?: Date;
    storage: string;
    receivedBy: string;
    items: GoodsReceiptItem[];
};

export function goodsReceiptDraft(
    receipt?: GoodsReceipt | null,
): GoodsReceiptDraft {
    return {
        receiptNumber: receipt?.receiptNumber ?? "",
        receiptDate: receipt?.receiptDate
            ? dateFromSearchValue(receipt.receiptDate.slice(0, 10))
            : new Date(),
        storage: receipt?.storage ?? "",
        receivedBy: receipt?.receivedBy ?? "",
        items: receipt?.items ?? [],
    };
}

export function useGoodsReceiptDraft() {
    const [draft, setDraft] = useState<GoodsReceiptDraft>(goodsReceiptDraft);
    const [cleanDraft, setCleanDraft] = useState(() =>
        JSON.stringify(goodsReceiptDraft()),
    );
    const serialized = useMemo(() => JSON.stringify(draft), [draft]);

    return {
        draft,
        setDraft,
        setField: <K extends keyof GoodsReceiptDraft>(
            field: K,
            value: GoodsReceiptDraft[K],
        ) => setDraft((current) => ({ ...current, [field]: value })),
        markClean: (value: GoodsReceiptDraft = draft) =>
            setCleanDraft(JSON.stringify(value)),
        markUnsaved: () => setCleanDraft("__unsaved__"),
        hasUnsavedChanges: serialized !== cleanDraft,
    };
}
