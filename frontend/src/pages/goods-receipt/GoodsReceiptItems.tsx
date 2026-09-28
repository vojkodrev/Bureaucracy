import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import AddEditInventoryItemDialog from "./AddEditInventoryItemDialog";

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

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Received stock items</CardTitle>
                <Button type="button" size="sm" onClick={openNew}>
                    <Plus /> Add stock item
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Stock item code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Unit of measure</TableHead>
                            <TableHead className="text-right">
                                Received quantity
                            </TableHead>
                            <TableHead className="w-20">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <MessageRow>Loading receipt items…</MessageRow>
                        )}
                        {!isLoading && items.length === 0 && (
                            <MessageRow>No stock items added.</MessageRow>
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
