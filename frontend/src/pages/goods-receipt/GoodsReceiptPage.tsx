import { Copy, Save, Undo2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "@/components/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle } from
    "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import GoodsReceiptItems from "./GoodsReceiptItems";
import GoodsReceiptNumberAlert from "./GoodsReceiptNumberAlert";
import StorageComboboxField from "./StorageComboboxField";
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
    const errors = [
        [
            "receipt",
            "Goods receipt could not be loaded",
            "The receipt data could not be retrieved.",
            loader.error,
        ],
        [
            "save",
            "Goods receipt could not be saved",
            "Your changes were not saved.",
            save.saveError,
        ],
        [
            "duplicate",
            "Goods receipt could not be duplicated",
            "The new goods receipt draft could not be prepared.",
            duplicate.duplicateError,
        ],
        [
            "next-number",
            "Next receipt number could not be loaded",
            "Enter a receipt number manually before saving.",
            loader.nextNumberError,
        ],
    ] as const;

    return (
        <div className="max-w-5xl p-4">
            {errors.some(([, , , error]) => error) && (
                <div className="mb-6 space-y-2">
                    {errors.map(([key, title, description, error]) =>
                        error && (
                        <ErrorAlert
                            key={key}
                            title={title}
                            description={description}
                            error={error}
                        />
                        ))}
                </div>
            )}
            <Menubar className="mb-6 w-fit">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={!save.canSave || save.isSaving}
                            onClick={() => { void save.requestSave(); }}
                        >
                            <Save />
                            {save.isSaving ? "Saving…" : "Save"}
                            <MenubarShortcut>Ctrl+S</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={!revert.canRevert}
                            onClick={revert.requestRevert}
                        >
                            <Undo2 /> Revert
                        </MenubarItem>
                        <MenubarItem
                            disabled={
                                loader.receiptId == null ||
                                loader.isLoading ||
                                save.isSaving ||
                                duplicate.isDuplicating
                            }
                            onClick={() => { void duplicate.duplicate(); }}
                        >
                            <Copy />
                            {duplicate.isDuplicating
                                ? "Duplicating…"
                                : "Duplicate"}
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <GoodsReceiptNumberAlert
                receiptNumber={draftState.draft.receiptNumber.trim()}
                warning={save.numberWarning}
                onOpenChange={(open) => {
                    if (!open) save.setNumberWarning(null);
                }}
                onConfirm={() => { void save.confirmSave(); }}
            />
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Goods receipt details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-number">
                            Receipt number
                        </FieldLabel>
                        <Input
                            id="goods-receipt-number"
                            maxLength={10}
                            value={draftState.draft.receiptNumber}
                            onChange={(event) => draftState.setField(
                                "receiptNumber",
                                event.target.value,
                            )}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-date">
                            Receipt date
                        </FieldLabel>
                        <Input
                            id="goods-receipt-date"
                            type="date"
                            value={draftState.draft.receiptDate}
                            onChange={(event) => draftState.setField(
                                "receiptDate",
                                event.target.value,
                            )}
                        />
                    </Field>
                    <StorageComboboxField
                        value={draftState.draft.storage}
                        onChange={(value) =>
                            draftState.setField("storage", value)}
                    />
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-received-by">
                            Received by
                        </FieldLabel>
                        <Input
                            id="goods-receipt-received-by"
                            maxLength={30}
                            value={draftState.draft.receivedBy}
                            onChange={(event) => draftState.setField(
                                "receivedBy",
                                event.target.value,
                            )}
                        />
                    </Field>
                </CardContent>
            </Card>
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
