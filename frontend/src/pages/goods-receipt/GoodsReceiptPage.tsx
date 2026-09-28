import { useNavigate, useParams } from "react-router-dom";
import GoodsReceiptErrors from "./GoodsReceiptErrors";
import GoodsReceiptGeneralInformation from
    "./GoodsReceiptGeneralInformation";
import GoodsReceiptItems from "./GoodsReceiptItems";
import GoodsReceiptMenu from "./GoodsReceiptMenu";
import GoodsReceiptNumberAlert from "./GoodsReceiptNumberAlert";
import UnsavedGoodsReceiptAlerts from "./UnsavedGoodsReceiptAlerts";
import { useGoodsReceiptDraft } from "./hooks/useGoodsReceiptDraft";
import { useGoodsReceiptDuplicate } from "./hooks/useGoodsReceiptDuplicate";
import { useGoodsReceiptLoader } from "./hooks/useGoodsReceiptLoader";
import { useGoodsReceiptKeyboardShortcuts } from
    "./hooks/useGoodsReceiptKeyboardShortcuts";
import { useGoodsReceiptRevert } from "./hooks/useGoodsReceiptRevert";
import { useGoodsReceiptSave } from "./hooks/useGoodsReceiptSave";
import { useUnsavedGoodsReceiptGuard } from
    "./hooks/useUnsavedGoodsReceiptGuard";

export default function GoodsReceiptPage() {
    const { receiptNumber } = useParams();
    const navigate = useNavigate();
    const draftState = useGoodsReceiptDraft();
    const guard = useUnsavedGoodsReceiptGuard(
        draftState.hasUnsavedChanges,
    );
    const loader = useGoodsReceiptLoader(
        receiptNumber,
        draftState.setDraft,
        draftState.markClean,
        guard.disallowNavigation,
    );
    const duplicate = useGoodsReceiptDuplicate({
        receiptId: loader.receiptId,
        draft: draftState.draft,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        navigate,
        replaceDraft: draftState.setDraft,
        markUnsaved: draftState.markUnsaved,
        setReceiptId: loader.setReceiptId,
        preserveDuplicateDraft: loader.preserveDuplicateDraft,
        allowNavigation: guard.allowNavigation,
    });
    const save = useGoodsReceiptSave({
        receiptId: loader.receiptId,
        draft: draftState.draft,
        routeReceiptNumber: receiptNumber,
        isLoading: loader.isLoading,
        loadError: loader.error,
        isDuplicating: duplicate.isDuplicating,
        navigate,
        replaceDraft: draftState.setDraft,
        markClean: draftState.markClean,
        setReceiptId: loader.setReceiptId,
        allowNavigation: guard.allowNavigation,
        reload: loader.reload,
        clearDuplicateError: () => duplicate.setDuplicateError(null),
    });
    const revert = useGoodsReceiptRevert({
        routeReceiptNumber: receiptNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        isSaving: save.isSaving,
        isDuplicating: duplicate.isDuplicating,
        clearSaveError: () => save.setSaveError(null),
        reload: loader.reload,
    });
    useGoodsReceiptKeyboardShortcuts(() => {
        void save.requestSave();
    });
    return (
        <div className="max-w-5xl p-4">
            <GoodsReceiptErrors
                loadError={loader.error}
                saveError={save.saveError}
                duplicateError={duplicate.duplicateError}
                nextNumberError={loader.nextNumberError}
            />
            <GoodsReceiptMenu
                canSave={save.canSave}
                canRevert={revert.canRevert}
                canDuplicate={
                    loader.receiptId != null &&
                    !loader.isLoading &&
                    !save.isSaving
                }
                isSaving={save.isSaving}
                isDuplicating={duplicate.isDuplicating}
                onSave={() => { void save.requestSave(); }}
                onRevert={revert.requestRevert}
                onDuplicate={() => { void duplicate.duplicate(); }}
            />
            <GoodsReceiptNumberAlert
                receiptNumber={draftState.draft.receiptNumber.trim()}
                warning={save.numberWarning}
                onOpenChange={(open) => {
                    if (!open) save.setNumberWarning(null);
                }}
                onConfirm={() => { void save.confirmSave(); }}
            />
            <GoodsReceiptGeneralInformation
                receiptNumber={draftState.draft.receiptNumber}
                receiptDate={draftState.draft.receiptDate}
                storage={draftState.draft.storage}
                receivedBy={draftState.draft.receivedBy}
                onReceiptNumberChange={(value) =>
                    draftState.setField("receiptNumber", value)}
                onReceiptDateChange={(value) =>
                    draftState.setField("receiptDate", value)}
                onStorageChange={(value) =>
                    draftState.setField("storage", value)}
                onReceivedByChange={(value) =>
                    draftState.setField("receivedBy", value)}
            />
            <div className="mt-6">
                <GoodsReceiptItems
                    items={draftState.draft.items}
                    isLoading={loader.isLoading}
                    onChange={(items) => draftState.setField("items", items)}
                />
            </div>
            <UnsavedGoodsReceiptAlerts
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
        </div>
    );
}
