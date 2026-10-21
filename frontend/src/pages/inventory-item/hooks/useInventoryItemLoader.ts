import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import {
    fetchInventoryItem,
    fetchNextInventoryItemCode,
} from "../inventory-item-api";
import {
    inventoryItemDraft,
    type InventoryItemDraft,
} from "./useInventoryItemDraft";

type Options = {
    routeInventoryItemCode?: string;
    defaultName: string;
    defaultUnit: string;
    replaceDraft: (draft: InventoryItemDraft) => void;
    markClean: (draft: InventoryItemDraft) => void;
    disallowNavigation: () => void;
};

const wasAborted = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";

export function useInventoryItemLoader({
    routeInventoryItemCode,
    defaultName,
    defaultUnit,
    replaceDraft,
    markClean,
    disallowNavigation,
}: Options) {
    const preserveDuplicateRef = useRef(false);
    const announcedProductDraft = useRef(false);
    const [itemId, setItemId] = useState<number | null>(null);
    const [reloadVersion, setReloadVersion] = useState(0);
    const replaceLoadedDraft = useEffectEvent(replaceDraft);
    const markLoadedDraftClean = useEffectEvent(markClean);
    const finishNavigation = useEffectEvent(disallowNavigation);
    const requestKey = [
        routeInventoryItemCode ?? "",
        defaultName,
        defaultUnit,
        reloadVersion,
    ].join(":");
    const [loadResult, setLoadResult] = useState({
        requestKey: "__initial__",
        error: null as string | null,
    });
    const isLoading = Boolean(routeInventoryItemCode) &&
        loadResult.requestKey !== requestKey;
    const error = loadResult.requestKey === requestKey
        ? loadResult.error
        : null;

    useEffect(() => {
        if (!routeInventoryItemCode) return;
        const controller = new AbortController();
        void fetchInventoryItem(routeInventoryItemCode, controller.signal)
            .then((item) => {
                const loadedDraft = inventoryItemDraft(item);
                setItemId(item.id);
                replaceLoadedDraft(loadedDraft);
                markLoadedDraftClean(loadedDraft);
                finishNavigation();
                setLoadResult({ requestKey, error: null });
            })
            .catch((requestError: unknown) => {
                if (wasAborted(requestError)) return;
                setLoadResult({
                    requestKey,
                    error: requestError instanceof Error
                        ? requestError.message
                        : "Loading inventory item failed",
                });
            });
        return () => controller.abort();
    }, [requestKey, routeInventoryItemCode, defaultName, defaultUnit]);

    useEffect(() => {
        if (routeInventoryItemCode) return;
        if (preserveDuplicateRef.current) {
            preserveDuplicateRef.current = false;
            finishNavigation();
            setLoadResult({ requestKey, error: null });
            return;
        }
        const emptyDraft = inventoryItemDraft();
        setItemId(null);
        replaceLoadedDraft(emptyDraft);
        markLoadedDraftClean(emptyDraft);
        finishNavigation();
        setLoadResult({ requestKey, error: null });

        const controller = new AbortController();
        void fetchNextInventoryItemCode(controller.signal)
            .then((inventoryItemCode) => {
                const codeOnlyDraft = { ...emptyDraft, inventoryItemCode };
                const initialDraft = {
                    ...codeOnlyDraft,
                    name: defaultName,
                    unit: defaultUnit,
                };
                replaceLoadedDraft(initialDraft);
                markLoadedDraftClean(
                    defaultName || defaultUnit ? codeOnlyDraft : initialDraft,
                );
                if ((defaultName || defaultUnit) &&
                    !announcedProductDraft.current) {
                    announcedProductDraft.current = true;
                    toast.add({
                        title: "Inventory item draft created",
                        description:
                            `Inventory item code ${inventoryItemCode} has been assigned. ` +
                            "Review the inventory item and save it when ready.",
                        type: "info",
                    });
                }
            })
            .catch((requestError: unknown) => {
                if (!wasAborted(requestError)) console.error(requestError);
            });
        return () => controller.abort();
    }, [requestKey, routeInventoryItemCode, defaultName, defaultUnit]);

    return {
        itemId,
        setItemId,
        isLoading,
        error,
        reload: () => setReloadVersion((version) => version + 1),
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
        preserveDuplicateDraft: () => {
            preserveDuplicateRef.current = true;
        },
    };
}
