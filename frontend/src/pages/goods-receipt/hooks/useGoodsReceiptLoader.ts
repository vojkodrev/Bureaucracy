import { useEffect, useEffectEvent, useRef, useState } from "react";
import { dateFromSearchValue } from "@/lib/dates";
import {
    clearGoodsReceiptHandoff,
    readGoodsReceiptHandoff,
} from "../goods-receipt-handoff";
import {
    fetchGoodsReceipt,
    fetchNextGoodsReceiptNumber,
} from "../goods-receipt-api";
import {
    goodsReceiptDraft,
    type GoodsReceiptDraft,
} from "./useGoodsReceiptDraft";

export function useGoodsReceiptLoader(
    routeReceiptNumber: string | undefined,
    defaultReceivedBy: string,
    replaceDraft: (draft: GoodsReceiptDraft) => void,
    markClean: (draft: GoodsReceiptDraft) => void,
    disallowNavigation: () => void,
    markUnsaved: () => void,
) {
    const preserveDuplicateRef = useRef(false);
    const [receiptId, setReceiptId] = useState<number | null>(null);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [result, setResult] = useState({
        key: "__initial__",
        error: null as string | null,
    });
    const [nextNumberError, setNextNumberError] = useState<string | null>(null);
    const key = `${routeReceiptNumber ?? ""}:${reloadVersion}`;
    const replace = useEffectEvent(replaceDraft);
    const clean = useEffectEvent(markClean);
    const finish = useEffectEvent(disallowNavigation);
    const markConverted = useEffectEvent(markUnsaved);

    useEffect(() => {
        const controller = new AbortController();
        const handoff = readGoodsReceiptHandoff(routeReceiptNumber);
        const applyHandoff = (draft: GoodsReceiptDraft) => {
            if (!handoff) {
                replace(draft);
                clean(draft);
                return;
            }
            clearGoodsReceiptHandoff();
            replace({
                ...draft,
                receiptDate: !routeReceiptNumber && handoff.receiptDate
                    ? dateFromSearchValue(handoff.receiptDate)
                    : draft.receiptDate,
                items: [...draft.items, ...handoff.items],
            });
            markConverted();
        };
        if (!routeReceiptNumber) {
            if (preserveDuplicateRef.current) {
                preserveDuplicateRef.current = false;
                finish();
                setResult({ key, error: null });
                return;
            }
            const next = goodsReceiptDraft(undefined, defaultReceivedBy);
            setReceiptId(null);
            replace(next);
            clean(next);
            finish();
            setResult({ key, error: null });
            setNextNumberError(null);
            void fetchNextGoodsReceiptNumber(controller.signal)
                .then((receiptNumber) => {
                    if (controller.signal.aborted) return;
                    const numberedDraft = {
                        ...next,
                        receiptNumber,
                    };
                    applyHandoff(numberedDraft);
                })
                .catch((error: unknown) => {
                    if (controller.signal.aborted) return;
                    if (error instanceof DOMException &&
                        error.name === "AbortError") return;
                    if (handoff) applyHandoff(next);
                    setNextNumberError(error instanceof Error
                        ? error.message
                        : "Loading next goods receipt number failed");
                });
            return () => controller.abort();
        }
        void fetchGoodsReceipt(routeReceiptNumber, controller.signal)
            .then((receipt) => {
                if (controller.signal.aborted) return;
                const next = goodsReceiptDraft(receipt);
                setReceiptId(receipt.id);
                applyHandoff(next);
                finish();
                setResult({ key, error: null });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
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
    }, [key, routeReceiptNumber, defaultReceivedBy]);

    return {
        receiptId,
        setReceiptId,
        isLoading: Boolean(routeReceiptNumber) && result.key !== key,
        error: result.key === key ? result.error : null,
        nextNumberError,
        reload: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => {
            preserveDuplicateRef.current = true;
        },
    };
}
