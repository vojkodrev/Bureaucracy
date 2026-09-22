import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { emptyToNull } from "@/lib/form-input";
import type { InventoryItem } from "@/lib/inventory-item-types";
import { isOptionalNonNegativeNumber, numberOrNull } from "@/lib/numbers";
import { toast } from "@/lib/toast";
import InventoryItemErrors from "./InventoryItemErrors";
import InventoryItemMenu from "./InventoryItemMenu";
import UnsavedInventoryItemAlerts from "./UnsavedInventoryItemAlerts";
import { useInventoryItemKeyboardShortcuts } from "./hooks/useInventoryItemKeyboardShortcuts";
import { useUnsavedInventoryItemGuard } from "./hooks/useUnsavedInventoryItemGuard";
import InventoryItemDetails from "./InventoryItemDetails";
import InventoryItemRelatedData from "./InventoryItemRelatedData";
import {
    fetchInventoryItem,
    fetchNextInventoryItemCode,
    postSaveInventoryItem,
} from "./inventory-item-api";

type Draft = {
    productCode: string;
    name: string;
    unit: string;
    minimumStockLevel: string;
};
const emptyDraft = (): Draft => ({
    productCode: "",
    name: "",
    unit: "",
    minimumStockLevel: "",
});
const itemDraft = (item: InventoryItem): Draft => ({
    productCode: item.productCode ?? "",
    name: item.name ?? "",
    unit: item.unit ?? "",
    minimumStockLevel:
        item.minimumStockLevel == null ? "" : String(item.minimumStockLevel),
});

export default function InventoryItemPage() {
    const { productCode: routeProductCode } = useParams();
    const navigate = useNavigate();
    const [draft, setDraft] = useState(emptyDraft);
    const [cleanDraft, setCleanDraft] = useState(() =>
        JSON.stringify(emptyDraft()),
    );
    const [itemId, setItemId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [confirmingRevert, setConfirmingRevert] = useState(false);
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false);
    const [reloadVersion, setReloadVersion] = useState(0);
    const preserveDuplicate = useRef(false);
    const hasUnsavedChanges = useMemo(
        () => JSON.stringify(draft) !== cleanDraft,
        [draft, cleanDraft],
    );
    const guard = useUnsavedInventoryItemGuard(hasUnsavedChanges);

    useEffect(() => {
        if (routeProductCode) {
            const controller = new AbortController();
            setIsLoading(true);
            setLoadError(null);
            void fetchInventoryItem(routeProductCode, controller.signal)
                .then((item) => {
                    const loaded = itemDraft(item);
                    setItemId(item.id);
                    setDraft(loaded);
                    setCleanDraft(JSON.stringify(loaded));
                    guard.disallowNavigation();
                })
                .catch((error: unknown) => {
                    if (!(
                        error instanceof DOMException &&
                        error.name === "AbortError"
                    ))
                        setLoadError(
                            error instanceof Error
                                ? error.message
                                : "Loading inventory item failed",
                        );
                })
                .finally(() => setIsLoading(false));
            return () => controller.abort();
        }
        if (preserveDuplicate.current) {
            preserveDuplicate.current = false;
            guard.disallowNavigation();
            return;
        }
        const initial = emptyDraft();
        setItemId(null);
        setDraft(initial);
        setCleanDraft(JSON.stringify(initial));
        setLoadError(null);
        guard.disallowNavigation();
        const controller = new AbortController();
        void fetchNextInventoryItemCode(controller.signal)
            .then((productCode) => {
                const next = { ...initial, productCode };
                setDraft(next);
                setCleanDraft(JSON.stringify(next));
            })
            .catch((error: unknown) => {
                if (!(
                    error instanceof DOMException && error.name === "AbortError"
                ))
                    console.error(error);
            });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeProductCode, reloadVersion]);

    const canSave =
        Boolean(draft.productCode.trim() && draft.name.trim()) &&
        isOptionalNonNegativeNumber(draft.minimumStockLevel) &&
        !isLoading &&
        !isDuplicating &&
        !loadError;
    const save = async () => {
        if (!canSave || isSaving) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const saved = await postSaveInventoryItem({
                id: itemId,
                productCode: draft.productCode.trim(),
                name: emptyToNull(draft.name),
                unit: emptyToNull(draft.unit),
                minimumStockLevel: numberOrNull(draft.minimumStockLevel),
            });
            const next = itemDraft(saved);
            const creating = itemId == null;
            setItemId(saved.id);
            setDraft(next);
            setCleanDraft(JSON.stringify(next));
            toast.add({
                title: "Inventory item saved",
                description: `${saved.productCode} was ${creating ? "created" : "updated"} successfully.`,
                type: "success",
            });
            if (routeProductCode === saved.productCode)
                setReloadVersion((value) => value + 1);
            else {
                guard.allowNavigation();
                navigate(
                    `/inventory-item/${encodeURIComponent(saved.productCode ?? "")}`,
                );
            }
        } catch (error: unknown) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Saving inventory item failed",
            );
        } finally {
            setIsSaving(false);
        }
    };
    useInventoryItemKeyboardShortcuts(() => {
        void save();
    });

    const revert = () => {
        setConfirmingRevert(false);
        setSaveError(null);
        if (routeProductCode) setReloadVersion((value) => value + 1);
        else {
            const next = emptyDraft();
            setDraft(next);
            setCleanDraft(JSON.stringify(next));
        }
        toast.add({
            title: "Inventory item reverted",
            description: routeProductCode
                ? `${routeProductCode} was restored to its last saved version.`
                : "The new inventory item form was cleared.",
            type: "success",
        });
    };
    const duplicate = async () => {
        if (itemId == null || isDuplicating) return;
        if (hasUnsavedChanges && !confirmingDuplicate) {
            setConfirmingDuplicate(true);
            return;
        }
        setConfirmingDuplicate(false);
        setIsDuplicating(true);
        setSaveError(null);
        try {
            const productCode = await fetchNextInventoryItemCode();
            setItemId(null);
            setDraft((current) => ({ ...current, productCode }));
            setCleanDraft("__unsaved__");
            preserveDuplicate.current = true;
            guard.allowNavigation();
            navigate("/inventory-item");
            toast.add({
                title: "Inventory item duplicated",
                description: `Product code ${productCode} has been assigned to the new unsaved copy.`,
                type: "info",
            });
        } catch (error: unknown) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Duplicating inventory item failed",
            );
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <div className="max-w-5xl p-4">
            <InventoryItemErrors loadError={loadError} saveError={saveError} />
            <InventoryItemMenu
                canSave={canSave}
                canRevert={hasUnsavedChanges && !isDuplicating}
                canDuplicate={itemId != null && !isLoading && !isSaving}
                isSaving={isSaving}
                isDuplicating={isDuplicating}
                onSave={() => {
                    void save();
                }}
                onRevert={() => setConfirmingRevert(true)}
                onDuplicate={() => {
                    void duplicate();
                }}
            />
            <UnsavedInventoryItemAlerts
                isNavigationBlocked={guard.blocker.state === "blocked"}
                isConfirmingRevert={confirmingRevert}
                isConfirmingDuplicate={confirmingDuplicate}
                onCancelNavigation={() => {
                    if (guard.blocker.state === "blocked") guard.blocker.reset();
                }}
                onDiscardAndNavigate={guard.discardAndNavigate}
                onConfirmingRevertChange={setConfirmingRevert}
                onDiscardAndRevert={revert}
                onConfirmingDuplicateChange={setConfirmingDuplicate}
                onDuplicateAnyway={() => { void duplicate(); }}
            />
            <div className="max-w-lg">
                <InventoryItemDetails
                    {...draft}
                    onChange={(field, value) =>
                        setDraft((current) => ({ ...current, [field]: value }))
                    }
                />
            </div>
            <InventoryItemRelatedData
                itemId={itemId}
                name={draft.name}
                hasUnsavedChanges={hasUnsavedChanges}
                onItemSelect={(code) => {
                    void navigate(
                        `/inventory-item/${encodeURIComponent(code)}`,
                    );
                }}
                onProductSelect={(code) => {
                    void navigate(`/product/${encodeURIComponent(code)}`);
                }}
            />
        </div>
    );
}
