import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DuplicateIdentifierAlert from "@/components/DuplicateIdentifierAlert";
import InventoryItemDetails from "./InventoryItemDetails";
import InventoryItemErrors from "./InventoryItemErrors";
import InventoryItemMenu from "./InventoryItemMenu";
import InventoryItemRelatedData from "./InventoryItemRelatedData";
import UnsavedInventoryItemAlerts from "./UnsavedInventoryItemAlerts";
import { useInventoryItemDraft } from "./hooks/useInventoryItemDraft";
import { useInventoryItemDuplicate } from "./hooks/useInventoryItemDuplicate";
import { useInventoryItemKeyboardShortcuts } from "./hooks/useInventoryItemKeyboardShortcuts";
import { useInventoryItemLoader } from "./hooks/useInventoryItemLoader";
import { useInventoryItemRevert } from "./hooks/useInventoryItemRevert";
import { useInventoryItemSave } from "./hooks/useInventoryItemSave";
import { useUnsavedInventoryItemGuard } from "./hooks/useUnsavedInventoryItemGuard";

export default function InventoryItemPage() {
    const { productCode: routeProductCode } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const draftState = useInventoryItemDraft();
    const { draft, setDraft, setField } = draftState;
    const guard = useUnsavedInventoryItemGuard(
        draftState.hasUnsavedChanges,
    );
    const loader = useInventoryItemLoader({
        routeProductCode,
        defaultName: searchParams.get("name") ?? "",
        defaultUnit: searchParams.get("unit") ?? "",
        replaceDraft: setDraft,
        markClean: draftState.markClean,
        disallowNavigation: guard.disallowNavigation,
    });
    const duplicate = useInventoryItemDuplicate({
        itemId: loader.itemId,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        navigate,
        setItemId: loader.setItemId,
        replaceDraft: setDraft,
        markUnsaved: draftState.markUnsaved,
        preserveDuplicateDraft: loader.preserveDuplicateDraft,
        allowNavigation: guard.allowNavigation,
    });
    const save = useInventoryItemSave({
        itemId: loader.itemId,
        draft,
        routeProductCode,
        isLoading: loader.isLoading,
        loadError: loader.error,
        isDuplicating: duplicate.isDuplicating,
        navigate,
        replaceDraft: setDraft,
        markClean: draftState.markClean,
        setItemId: loader.setItemId,
        clearDuplicateError: () => duplicate.setDuplicateError(null),
        allowNavigation: guard.allowNavigation,
        reloadAfterSave: loader.reloadAfterSave,
    });
    const revert = useInventoryItemRevert({
        routeProductCode,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isDuplicating: duplicate.isDuplicating,
        clearSaveError: () => save.setSaveError(null),
        clearDuplicateError: () => duplicate.setDuplicateError(null),
        replaceDraft: setDraft,
        markClean: draftState.markClean,
        reload: loader.reload,
    });
    useInventoryItemKeyboardShortcuts(() => {
        void save.saveInventoryItem();
    });

    return (
        <div className="max-w-5xl p-4">
            <InventoryItemErrors
                loadError={loader.error}
                saveError={save.saveError ?? duplicate.duplicateError}
            />
            <InventoryItemMenu
                canSave={save.canSave}
                canRevert={revert.canRevert}
                canDuplicate={
                    loader.itemId != null &&
                    !loader.isLoading &&
                    !save.isSaving
                }
                isSaving={save.isSaving}
                isDuplicating={duplicate.isDuplicating}
                onSave={() => {
                    void save.saveInventoryItem();
                }}
                onRevert={revert.requestRevert}
                onDuplicate={() => {
                    void duplicate.duplicate();
                }}
            />
            <DuplicateIdentifierAlert
                open={save.duplicateCodeWarning}
                recordName="inventory item"
                identifierLabel="Product code"
                identifier={draft.productCode.trim()}
                onOpenChange={save.setDuplicateCodeWarning}
            />
            <UnsavedInventoryItemAlerts
                isNavigationBlocked={guard.blocker.state === "blocked"}
                isConfirmingRevert={revert.confirmingRevert}
                isConfirmingDuplicate={duplicate.confirmingDuplicate}
                onCancelNavigation={() => {
                    if (guard.blocker.state === "blocked") {
                        guard.blocker.reset();
                    }
                }}
                onDiscardAndNavigate={guard.discardAndNavigate}
                onConfirmingRevertChange={revert.setConfirmingRevert}
                onDiscardAndRevert={revert.performRevert}
                onConfirmingDuplicateChange={
                    duplicate.setConfirmingDuplicate
                }
                onDuplicateAnyway={() => {
                    void duplicate.performDuplicate();
                }}
            />
            <div className="max-w-lg">
                <InventoryItemDetails
                    {...draft}
                    onChange={(field, value) => setField(field, value)}
                />
            </div>
            <InventoryItemRelatedData
                itemId={loader.itemId}
                name={draft.name}
                hasUnsavedChanges={draftState.hasUnsavedChanges}
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
