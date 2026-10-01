import { useEffect, useMemo, useState } from "react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import ErrorAlert from "@/components/ErrorAlert";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { goodsReceiptPhotoUrl } from "@/pages/goods-receipt/goods-receipt-api";
import {
    fetchLatestInventoryItemPhotos,
    type InventoryItemPhotoSource,
} from "./inventory-item-api";

type Props = { productCode: string };

export default function InventoryItemPhotos({ productCode }: Props) {
    const [result, setResult] = useState<{
        productCode: string;
        source: InventoryItemPhotoSource | null;
        error: string | null;
    }>({ productCode: "", source: null, error: null });
    const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
    const wheelGesturesPlugin = useMemo(() => WheelGesturesPlugin(), []);
    const isLoading = result.productCode !== productCode;
    const source = isLoading ? null : result.source;
    const error = isLoading ? null : result.error;

    useEffect(() => {
        const controller = new AbortController();
        void fetchLatestInventoryItemPhotos(productCode, controller.signal)
            .then((source) => setResult({ productCode, source, error: null }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException &&
                    requestError.name === "AbortError") return;
                setResult({
                    productCode,
                    source: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : "Loading photos failed",
                });
            });
        return () => controller.abort();
    }, [productCode]);

    return (
        <div className="p-4">
            {error && (
                <ErrorAlert
                    title="Photos could not be loaded"
                    description="The latest goods receipt item photos could not be retrieved."
                    error={error}
                />
            )}
            {!error && isLoading && (
                <p className="text-sm text-muted-foreground">Loading photos…</p>
            )}
            {!error && !isLoading && !source && (
                <p className="text-sm text-muted-foreground">
                    No photos found on a positive goods receipt item.
                </p>
            )}
            {source && (
                <Carousel
                    opts={{ align: "start" }}
                    plugins={[wheelGesturesPlugin]}
                    className="w-full"
                >
                    <CarouselContent>
                        {source.photos.map((photo) => (
                            <CarouselItem
                                key={photo.fileId}
                                className="basis-[48%] md:basis-[30%]"
                            >
                                <div className="p-1">
                                    <Card className="overflow-hidden py-0">
                                        <CardContent className="aspect-square p-0">
                                            <button
                                                type="button"
                                                className="h-full w-full cursor-zoom-in"
                                                aria-label="View photo"
                                                onClick={() => setPreviewPhotoId(photo.fileId)}
                                            >
                                                <AuthenticatedImage
                                                    src={goodsReceiptPhotoUrl(photo.fileId)}
                                                    alt={`Inventory item ${productCode}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
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
                            Large preview of the inventory item photo.
                        </DialogDescription>
                    </DialogHeader>
                    {previewPhotoId && (
                        <AuthenticatedImage
                            src={goodsReceiptPhotoUrl(previewPhotoId)}
                            alt={`Inventory item ${productCode} preview`}
                            className="h-[calc(100vh-6rem)] w-full object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
