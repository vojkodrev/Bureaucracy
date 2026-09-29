import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import InventoryItemPickerField from
    "@/components/inventory-item-search/InventoryItemPickerField";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import type { GoodsReceiptItem } from "@/lib/goods-receipt-types";
import {
    goodsReceiptPhotoUrl,
    uploadGoodsReceiptPhoto,
} from "./goods-receipt-api";

type Props = {
    item: GoodsReceiptItem | null;
    onOpenChange: (open: boolean) => void;
    onSave: (item: GoodsReceiptItem) => void;
};

export default function AddEditInventoryItemDialog({
    item,
    onOpenChange,
    onSave,
}: Props) {
    const [code, setCode] = useState(item?.productCode ?? "");
    const [description, setDescription] = useState(item?.productName ?? "");
    const [unit, setUnit] = useState(item?.unit ?? "");
    const [quantity, setQuantity] = useState(
        item?.quantity == null ? "" : String(item.quantity),
    );
    const [photos, setPhotos] = useState(item?.photos ?? []);
    const [isUploading, setIsUploading] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const quantityValue = quantity.trim() === "" ? null : Number(quantity);
    const canSave = code.trim().length > 0 &&
        quantityValue != null &&
        Number.isFinite(quantityValue) &&
        quantityValue !== 0 && !isUploading;

    const uploadPhotos = async (files: FileList | null) => {
        if (!files?.length) return;
        setIsUploading(true);
        setPhotoError(null);
        try {
            for (const file of Array.from(files)) {
                const photo = await uploadGoodsReceiptPhoto(file);
                setPhotos((current) => [...current, photo]);
            }
        } catch (error) {
            setPhotoError(error instanceof Error ? error.message : "Photo upload failed");
        } finally {
            setIsUploading(false);
            if (fileInput.current) fileInput.current.value = "";
        }
    };

    const removePhoto = (fileId: string) => {
        setPhotoError(null);
        setPhotos((current) => current.filter((photo) => photo.fileId !== fileId));
    };

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {item ? "Edit stock item" : "Add stock item"}
                    </DialogTitle>
                    <DialogDescription>
                        Select an inventory item and enter the stock movement
                        quantity. Use a negative value for stock going out.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-[1fr_2fr_8rem]">
                    <InventoryItemPickerField
                        id="goods-receipt-item-code"
                        label="Stock item code"
                        name="stockItemCode"
                        inventoryItemCode={code}
                        onInventoryItemCodeChange={setCode}
                        onInventoryItemNameChange={setDescription}
                        onInventoryItemUnitChange={setUnit}
                    />
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-item-description">
                            Description
                        </FieldLabel>
                        <Input
                            id="goods-receipt-item-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-item-unit">
                            Unit of measure
                        </FieldLabel>
                        <Input
                            id="goods-receipt-item-unit"
                            value={unit}
                            onChange={(event) => setUnit(event.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="goods-receipt-item-quantity">
                            Quantity
                        </FieldLabel>
                        <NumberInput
                            id="goods-receipt-item-quantity"
                            step="any"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                        />
                    </Field>
                </div>
                <Field>
                    <FieldLabel>Photos</FieldLabel>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(event) => { void uploadPhotos(event.target.files); }}
                    />
                    <div className="flex flex-wrap gap-3">
                        {photos.map((photo) => (
                            <div key={photo.fileId} className="group relative h-28 w-28 overflow-hidden rounded-md border bg-muted">
                                <img
                                    src={goodsReceiptPhotoUrl(photo.fileId)}
                                    alt="Goods receipt item"
                                    className="h-full w-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon-xs"
                                    className="absolute right-1 top-1"
                                    aria-label="Remove photo"
                                    onClick={() => removePhoto(photo.fileId)}
                                >
                                    <X />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="h-28 w-28 flex-col"
                            disabled={isUploading}
                            onClick={() => fileInput.current?.click()}
                        >
                            {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
                            {isUploading ? "Uploading…" : "Add photos"}
                        </Button>
                    </div>
                    {photoError && <p className="text-sm text-destructive">{photoError}</p>}
                </Field>
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                        Cancel
                    </DialogClose>
                    <Button
                        type="button"
                        disabled={!canSave}
                        onClick={() => onSave({
                            id: item?.id ?? 0,
                            productCode: code.trim(),
                            productName: description.trim() || null,
                            unit: unit.trim() || null,
                            quantity: quantityValue,
                            photos,
                        })}
                    >
                        {item ? "Save changes" : "Add stock item"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
