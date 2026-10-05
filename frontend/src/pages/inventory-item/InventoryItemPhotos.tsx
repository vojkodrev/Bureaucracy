import { useEffect, useState } from "react";
import ErrorAlert from "@/components/ErrorAlert";
import PhotoCarousel from "@/components/PhotoCarousel";
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
                <PhotoCarousel
                    photos={source.photos.map((photo) => ({
                        id: photo.fileId,
                        src: goodsReceiptPhotoUrl(photo.fileId),
                        alt: `Inventory item ${productCode}`,
                    }))}
                />
            )}
        </div>
    );
}
