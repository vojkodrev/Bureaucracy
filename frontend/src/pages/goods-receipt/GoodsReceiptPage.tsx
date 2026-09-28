import { useEffect } from "react";
import { Save, Undo2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "@/components/ErrorAlert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import StorageComboboxField from "./StorageComboboxField";
import { useGoodsReceiptDraft } from "./hooks/useGoodsReceiptDraft";
import { useGoodsReceiptLoader } from "./hooks/useGoodsReceiptLoader";
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
    const save = useGoodsReceiptSave({
        receiptId: loader.receiptId,
        draft: draftState.draft,
        routeReceiptNumber: receiptNumber,
        isLoading: loader.isLoading,
        loadError: loader.error,
        navigate,
        replaceDraft: draftState.setDraft,
        markClean: draftState.markClean,
        setReceiptId: loader.setReceiptId,
        allowNavigation: guard.allowNavigation,
        reload: loader.reload,
    });
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) ||
                event.key.toLowerCase() !== "s") return;
            event.preventDefault();
            void save.save();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [save]);
    const revert = () => {
        if (receiptNumber) loader.reload();
        else {
            guard.allowNavigation();
            void navigate("/goods-receipt", { replace: true });
        }
    };

    return (
        <div className="max-w-5xl p-4">
            {(loader.error || save.saveError) && (
                <div className="mb-6 space-y-2">
                    {loader.error && (
                        <ErrorAlert
                            title="Goods receipt could not be loaded"
                            description="The receipt data could not be retrieved."
                            error={loader.error}
                        />
                    )}
                    {save.saveError && (
                        <ErrorAlert
                            title="Goods receipt could not be saved"
                            description="Your changes were not saved."
                            error={save.saveError}
                        />
                    )}
                </div>
            )}
            <Menubar className="mb-6 w-fit">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={!save.canSave || save.isSaving}
                            onClick={() => { void save.save(); }}
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
                            disabled={!draftState.hasUnsavedChanges}
                            onClick={revert}
                        >
                            <Undo2 /> Revert
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
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
            <AlertDialog open={guard.blocker.state === "blocked"}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Changes to this goods receipt have not been saved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                if (guard.blocker.state === "blocked") {
                                    guard.blocker.reset();
                                }
                            }}
                        >
                            Keep editing
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={guard.discardAndNavigate}>
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
