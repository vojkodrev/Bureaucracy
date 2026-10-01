import { useMemo, useRef, useState } from "react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import InventoryItemPickerField from
    "@/components/inventory-item-search/InventoryItemPickerField";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import CameraCaptureDialog from "@/components/CameraCaptureDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
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
    const [cameraOpen, setCameraOpen] = useState(false);
    const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const cameraInput = useRef<HTMLInputElement>(null);
    const wheelGesturesPlugin = useMemo(() => WheelGesturesPlugin(), []);
    const quantityValue = quantity.trim() === "" ? null : Number(quantity);
    const canSave = code.trim().length > 0 &&
        quantityValue != null &&
        Number.isFinite(quantityValue) &&
        quantityValue !== 0 && !isUploading;

    const uploadPhotos = async (files: FileList | File[] | null) => {
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
            if (cameraInput.current) cameraInput.current.value = "";
        }
    };

    const removePhoto = (fileId: string) => {
        setPhotoError(null);
        setPhotos((current) => current.filter((photo) => photo.fileId !== fileId));
    };

    const openCamera = () => {
        if (typeof navigator.mediaDevices?.getUserMedia === "function") {
            setCameraOpen(true);
        } else {
            cameraInput.current?.click();
        }
    };

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-4xl">
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
                    <input
                        ref={cameraInput}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(event) => { void uploadPhotos(event.target.files); }}
                    />
                    <Carousel
                        opts={{ align: "start" }}
                        plugins={[wheelGesturesPlugin]}
                        className="w-full"
                    >
                        <CarouselContent>
                            {photos.map((photo) => (
                                <CarouselItem
                                    key={photo.fileId}
                                    className="basis-[48%] md:basis-[30%]"
                                >
                                    <div className="p-1">
                                        <Card className="overflow-hidden py-0">
                                            <CardContent className="relative aspect-square p-0">
                                                <button
                                                    type="button"
                                                    className="h-full w-full cursor-zoom-in"
                                                    aria-label="View photo"
                                                    onClick={() => setPreviewPhotoId(photo.fileId)}
                                                >
                                                    <AuthenticatedImage
                                                        src={goodsReceiptPhotoUrl(photo.fileId)}
                                                        alt="Goods receipt item"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon-xs"
                                                    className="absolute right-2 top-2 z-10"
                                                    aria-label="Remove photo"
                                                    onClick={() => removePhoto(photo.fileId)}
                                                >
                                                    <X />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                            <CarouselItem className="basis-[48%] md:basis-[30%]">
                                <div className="p-1">
                                    <Card className="py-0">
                                        <CardContent className="aspect-square p-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-full w-full flex-col rounded-xl"
                                                disabled={isUploading}
                                                onClick={() => fileInput.current?.click()}
                                            >
                                                {isUploading
                                                    ? <Loader2 className="animate-spin" />
                                                    : <ImagePlus />}
                                                {isUploading ? "Uploading…" : "Add photos"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                            <CarouselItem className="basis-[48%] md:basis-[30%]">
                                <div className="p-1">
                                    <Card className="py-0">
                                        <CardContent className="aspect-square p-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-full w-full flex-col rounded-xl"
                                                disabled={isUploading}
                                                onClick={openCamera}
                                            >
                                                <Camera />
                                                Take photo
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
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
                {cameraOpen && (
                    <CameraCaptureDialog
                        onOpenChange={setCameraOpen}
                        onCapture={async (file) => {
                            await uploadPhotos([file]);
                        }}
                    />
                )}
                <Dialog
                    open={previewPhotoId != null}
                    onOpenChange={(open) => {
                        if (!open) setPreviewPhotoId(null);
                    }}
                >
                    <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-w-[calc(100%-2rem)]">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Photo preview</DialogTitle>
                            <DialogDescription>
                                Large preview of the goods receipt item photo.
                            </DialogDescription>
                        </DialogHeader>
                        {previewPhotoId && (
                            <AuthenticatedImage
                                src={goodsReceiptPhotoUrl(previewPhotoId)}
                                alt="Goods receipt item preview"
                                className="h-[calc(100vh-6rem)] w-full object-contain"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
