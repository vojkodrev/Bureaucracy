import { useMemo, useState } from "react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import { Button } from "@/components/ui/button";
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

export type PhotoCarouselPhoto = {
    id: string;
    src: string;
    alt: string;
};

type Props = {
    photos: PhotoCarouselPhoto[];
    showPhotoActions?: boolean;
    isUploading?: boolean;
    onAddPhotos?: () => void;
    onTakePhoto?: () => void;
    onRemovePhoto?: (photoId: string) => void;
};

export default function PhotoCarousel({
    photos,
    showPhotoActions = false,
    isUploading = false,
    onAddPhotos,
    onTakePhoto,
    onRemovePhoto,
}: Props) {
    const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
    const wheelGesturesPlugin = useMemo(() => WheelGesturesPlugin(), []);
    const previewPhoto = photos.find((photo) => photo.id === previewPhotoId);

    return (
        <>
            <Carousel
                opts={{ align: "start" }}
                plugins={[wheelGesturesPlugin]}
                className="min-w-0 w-full"
            >
                <CarouselContent className="-ml-2 sm:-ml-4">
                    {photos.map((photo) => (
                        <CarouselItem
                            key={photo.id}
                            className="basis-40 pl-2 sm:basis-[48%] sm:pl-4 md:basis-[30%]"
                        >
                            <div className="p-0.5 sm:p-1">
                                <Card className="aspect-square overflow-hidden py-0">
                                    <CardContent className="relative h-full min-h-0 p-0">
                                        <button
                                            type="button"
                                            className="absolute inset-0 block cursor-zoom-in overflow-hidden"
                                            aria-label="View photo"
                                            onClick={() => setPreviewPhotoId(photo.id)}
                                        >
                                            <AuthenticatedImage
                                                src={photo.src}
                                                alt={photo.alt}
                                                className="block h-full w-full object-cover object-center"
                                            />
                                        </button>
                                        {onRemovePhoto && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon-xs"
                                                className="absolute right-2 top-2 z-10"
                                                aria-label="Remove photo"
                                                onClick={() => onRemovePhoto(photo.id)}
                                            >
                                                <X />
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                    {showPhotoActions && (
                        <>
                            <CarouselItem className="basis-40 pl-2 sm:basis-[48%] sm:pl-4 md:basis-[30%]">
                                <div className="p-0.5 sm:p-1">
                                    <Card className="aspect-square py-0">
                                        <CardContent className="h-full min-h-0 p-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-full w-full flex-col rounded-xl"
                                                disabled={isUploading}
                                                onClick={onAddPhotos}
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
                            <CarouselItem className="basis-40 pl-2 sm:basis-[48%] sm:pl-4 md:basis-[30%]">
                                <div className="p-0.5 sm:p-1">
                                    <Card className="aspect-square py-0">
                                        <CardContent className="h-full min-h-0 p-0">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-full w-full flex-col rounded-xl"
                                                disabled={isUploading}
                                                onClick={onTakePhoto}
                                            >
                                                <Camera />
                                                Take photo
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        </>
                    )}
                </CarouselContent>
            </Carousel>
            <Dialog
                open={previewPhoto != null}
                onOpenChange={(open) => {
                    if (!open) setPreviewPhotoId(null);
                }}
            >
                <DialogContent className="h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none place-items-center p-2 sm:max-w-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Photo preview</DialogTitle>
                        <DialogDescription>
                            Large preview of the selected photo.
                        </DialogDescription>
                    </DialogHeader>
                    {previewPhoto && (
                        <AuthenticatedImage
                            src={previewPhoto.src}
                            alt={`${previewPhoto.alt} preview`}
                            className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
