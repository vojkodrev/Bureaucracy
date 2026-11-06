import { useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    ClipboardPaste,
    Copy,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { GoodsReceiptItem } from "@/lib/goods-receipt-types";
import { toast } from "@/lib/toast";
import AddEditInventoryItemDialog from "./AddEditInventoryItemDialog";

const INVENTORY_ITEM_ROW_CLIPBOARD_TYPE =
    "bureaucracy/goods-receipt-inventory-item-row";

type InventoryItemRowClipboardData = {
    type: typeof INVENTORY_ITEM_ROW_CLIPBOARD_TYPE;
    version: 1;
    item: GoodsReceiptItem;
};

const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === "string";
const isNullableNumber = (value: unknown): value is number | null =>
    value === null || typeof value === "number" && Number.isFinite(value);

function isInventoryItemRowClipboardData(
    value: unknown,
): value is InventoryItemRowClipboardData {
    if (typeof value !== "object" || value === null) return false;
    const payload = value as Record<string, unknown>;
    if (
        payload.type !== INVENTORY_ITEM_ROW_CLIPBOARD_TYPE ||
        payload.version !== 1 ||
        typeof payload.item !== "object" ||
        payload.item === null
    ) return false;

    const item = payload.item as Record<string, unknown>;
    return typeof item.id === "number" &&
        isNullableString(item.productCode) &&
        isNullableString(item.productName) &&
        isNullableString(item.unit) &&
        isNullableNumber(item.quantity) &&
        Array.isArray(item.photos) &&
        item.photos.every((photo) =>
            typeof photo === "object" && photo !== null &&
            typeof (photo as Record<string, unknown>).fileId === "string");
}

type Props = {
    items: GoodsReceiptItem[];
    isLoading: boolean;
    onChange: (items: GoodsReceiptItem[]) => void;
};

export default function GoodsReceiptItems({
    items,
    isLoading,
    onChange,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const editingItem = editingIndex == null
        ? null
        : items[editingIndex] ?? null;

    const openNew = () => {
        setEditingIndex(null);
        setDialogOpen(true);
    };
    const openEdit = (index: number) => {
        setEditingIndex(index);
        setDialogOpen(true);
    };
    const save = (item: GoodsReceiptItem) => {
        if (editingIndex == null) {
            const nextId = Math.min(0, ...items.map(({ id }) => id)) - 1;
            onChange([...items, { ...item, id: nextId }]);
        } else {
            onChange(items.map((current, index) =>
                index === editingIndex
                    ? { ...item, id: current.id }
                    : current));
        }
        setDialogOpen(false);
    };
    const appendItem = (item: GoodsReceiptItem) => {
        const nextId = Math.min(0, ...items.map(({ id }) => id)) - 1;
        onChange([...items, { ...item, id: nextId }]);
    };
    const copyItem = async (item: GoodsReceiptItem) => {
        try {
            const payload: InventoryItemRowClipboardData = {
                type: INVENTORY_ITEM_ROW_CLIPBOARD_TYPE,
                version: 1,
                item,
            };
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            toast.add({
                title: "Inventory item row copied",
                description: "The inventory item row was copied as JSON.",
                type: "success",
            });
        } catch {
            toast.add({
                title: "Inventory item row could not be copied",
                description: "Clipboard access was unavailable.",
                type: "error",
            });
        }
    };
    const pasteItem = async () => {
        try {
            const payload: unknown = JSON.parse(
                await navigator.clipboard.readText(),
            );
            if (!isInventoryItemRowClipboardData(payload)) {
                throw new Error("Invalid inventory item row clipboard data");
            }
            appendItem(payload.item);
            toast.add({
                title: "Inventory item row pasted",
                description: "The copied inventory item was added to the receipt.",
                type: "success",
            });
        } catch {
            toast.add({
                title: "Inventory item row could not be pasted",
                description: "Copy an inventory item row and try again.",
                type: "error",
            });
        }
    };
    const moveItem = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= items.length) return;
        const reorderedItems = [...items];
        [reorderedItems[index], reorderedItems[targetIndex]] = [
            reorderedItems[targetIndex],
            reorderedItems[index],
        ];
        onChange(reorderedItems);
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Received inventory items</CardTitle>
                <div className="flex items-center gap-2">
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus /> Add inventory item
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { void pasteItem(); }}
                    >
                        <ClipboardPaste /> Paste inventory item
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Inventory item code</TableHead>
                            <TableHead>Inventory item name</TableHead>
                            <TableHead>Unit of measure</TableHead>
                            <TableHead className="text-right">
                                Quantity
                            </TableHead>
                            <TableHead className="w-36">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <MessageRow>Loading receipt items…</MessageRow>
                        )}
                        {!isLoading && items.length === 0 && (
                            <MessageRow>No inventory items added.</MessageRow>
                        )}
                        {!isLoading && items.map((item, index) => (
                            <TableRow key={`${item.id}-${index}`}>
                                <TableCell className="font-medium">
                                    {item.productCode || "—"}
                                </TableCell>
                                <TableCell>{item.productName || "—"}</TableCell>
                                <TableCell>{item.unit || "—"}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {item.quantity ?? "—"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Move ${item.productCode} up`}
                                            disabled={index === 0}
                                            onClick={() => moveItem(index, -1)}
                                        >
                                            <ArrowUp />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Move ${item.productCode} down`}
                                            disabled={index === items.length - 1}
                                            onClick={() => moveItem(index, 1)}
                                        >
                                            <ArrowDown />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Copy ${item.productCode}`}
                                            onClick={() => { void copyItem(item); }}
                                        >
                                            <Copy />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Edit ${item.productCode}`}
                                            onClick={() => openEdit(index)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Remove ${item.productCode}`}
                                            onClick={() => onChange(
                                                items.filter((_, itemIndex) =>
                                                    itemIndex !== index),
                                            )}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {dialogOpen && (
                <AddEditInventoryItemDialog
                    key={editingIndex ?? "new"}
                    item={editingItem}
                    onOpenChange={setDialogOpen}
                    onSave={save}
                />
            )}
        </Card>
    );
}

function MessageRow({ children }: { children: React.ReactNode }) {
    return (
        <TableRow>
            <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
            >
                {children}
            </TableCell>
        </TableRow>
    );
}
