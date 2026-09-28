import { useEffect, useEffectEvent, useState } from "react";
import { fetchGoodsReceipt } from "../goods-receipt-api";
import {
    goodsReceiptDraft,
    type GoodsReceiptDraft,
} from "./useGoodsReceiptDraft";

export function useGoodsReceiptLoader(
    routeReceiptNumber: string | undefined,
    replaceDraft: (draft: GoodsReceiptDraft) => void,
    markClean: (draft: GoodsReceiptDraft) => void,
    disallowNavigation: () => void,
) {
    const [receiptId, setReceiptId] = useState<number | null>(null);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [result, setResult] = useState({
        key: "__initial__",
        error: null as string | null,
    });
    const key = `${routeReceiptNumber ?? ""}:${reloadVersion}`;
    const replace = useEffectEvent(replaceDraft);
    const clean = useEffectEvent(markClean);
    const finish = useEffectEvent(disallowNavigation);

    useEffect(() => {
        const controller = new AbortController();
        if (!routeReceiptNumber) {
            const next = goodsReceiptDraft();
            setReceiptId(null);
            replace(next);
            clean(next);
            finish();
            setResult({ key, error: null });
            return;
        }
        void fetchGoodsReceipt(routeReceiptNumber, controller.signal)
            .then((receipt) => {
                const next = goodsReceiptDraft(receipt);
                setReceiptId(receipt.id);
                replace(next);
                clean(next);
                finish();
                setResult({ key, error: null });
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException &&
                    error.name === "AbortError") return;
                setResult({
                    key,
                    error: error instanceof Error
                        ? error.message
                        : "Loading goods receipt failed",
                });
            });
        return () => controller.abort();
    }, [key, routeReceiptNumber]);

    return {
        receiptId,
        setReceiptId,
        isLoading: Boolean(routeReceiptNumber) && result.key !== key,
        error: result.key === key ? result.error : null,
        reload: () => setReloadVersion((version) => version + 1),
    };
}
