import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
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

type Props = {
    onOpenChange: (open: boolean) => void;
    onCapture: (file: File, signal: AbortSignal) => Promise<void>;
};

type CameraCapabilities = MediaTrackCapabilities & {
    focusMode?: string[];
};

type CameraConstraints = MediaTrackConstraints & {
    focusMode?: "single-shot" | "continuous";
    pointsOfInterest?: Array<{ x: number; y: number }>;
};

type FocusPoint = {
    left: number;
    top: number;
};

export default function CameraCaptureDialog({
    onOpenChange,
    onCapture,
}: Props) {
    const video = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream | null>(null);
    const uploadController = useRef<AbortController | null>(null);
    const focusIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
    const [focusPoint, setFocusPoint] = useState<FocusPoint | null>(null);

    useEffect(() => {
        let active = true;
        void navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 4096 },
                height: { ideal: 3072 },
            },
            audio: false,
        }).then((cameraStream) => {
            if (!active) {
                cameraStream.getTracks().forEach((track) => track.stop());
                return;
            }
            stream.current = cameraStream;
            if (video.current) video.current.srcObject = cameraStream;

            // Ask capable mobile cameras to keep focusing between user taps.
            const track = cameraStream.getVideoTracks()[0];
            const capabilities = typeof track.getCapabilities === "function"
                ? track.getCapabilities() as CameraCapabilities
                : {} as CameraCapabilities;
            if (capabilities.focusMode?.includes("continuous")) {
                void track.applyConstraints({
                    focusMode: "continuous",
                } as CameraConstraints).catch(() => {
                    // Some browsers advertise a camera control but reject it.
                });
            }
        }).catch((cameraError: unknown) => {
            if (!active) return;
            setError(cameraError instanceof Error
                ? cameraError.message
                : "Camera access failed");
        });
        return () => {
            active = false;
            if (focusIndicatorTimer.current) {
                clearTimeout(focusIndicatorTimer.current);
            }
            stream.current?.getTracks().forEach((track) => track.stop());
            uploadController.current?.abort();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (capturedPhotoUrl) URL.revokeObjectURL(capturedPhotoUrl);
        };
    }, [capturedPhotoUrl]);

    const focusCamera = async (event: PointerEvent<HTMLVideoElement>) => {
        const source = video.current;
        const track = stream.current?.getVideoTracks()[0];
        if (!source || !track || !source.videoWidth || !source.videoHeight) return;

        const bounds = source.getBoundingClientRect();
        const scale = Math.min(
            bounds.width / source.videoWidth,
            bounds.height / source.videoHeight,
        );
        const displayedWidth = source.videoWidth * scale;
        const displayedHeight = source.videoHeight * scale;
        const offsetX = (bounds.width - displayedWidth) / 2;
        const offsetY = (bounds.height - displayedHeight) / 2;
        const localX = event.clientX - bounds.left;
        const localY = event.clientY - bounds.top;

        // Ignore taps in the black bars created by object-contain.
        if (
            localX < offsetX || localX > offsetX + displayedWidth ||
            localY < offsetY || localY > offsetY + displayedHeight
        ) return;

        const point = {
            x: (localX - offsetX) / displayedWidth,
            y: (localY - offsetY) / displayedHeight,
        };
        const capabilities = typeof track.getCapabilities === "function"
            ? track.getCapabilities() as CameraCapabilities
            : {} as CameraCapabilities;
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints() as
            MediaTrackSupportedConstraints & { pointsOfInterest?: boolean };

        if (!supportedConstraints.pointsOfInterest) return;

        const constraints: CameraConstraints = { pointsOfInterest: [point] };
        if (capabilities.focusMode?.includes("single-shot")) {
            constraints.focusMode = "single-shot";
        } else if (capabilities.focusMode?.includes("continuous")) {
            constraints.focusMode = "continuous";
        }

        try {
            await track.applyConstraints(constraints);
            setFocusPoint({
                left: (localX / bounds.width) * 100,
                top: (localY / bounds.height) * 100,
            });
            if (focusIndicatorTimer.current) {
                clearTimeout(focusIndicatorTimer.current);
            }
            focusIndicatorTimer.current = setTimeout(() => {
                setFocusPoint(null);
            }, 1200);
        } catch {
            // Keep the camera usable when focus controls are partially supported.
        }
    };

    const capture = async () => {
        const source = video.current;
        if (!source?.videoWidth || !source.videoHeight) return;
        setIsCapturing(true);
        setError(null);
        try {
            const canvas = document.createElement("canvas");
            canvas.width = source.videoWidth;
            canvas.height = source.videoHeight;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Could not capture camera image");
            context.drawImage(source, 0, 0, canvas.width, canvas.height);
            const blob = await new Promise<Blob>((resolve, reject) =>
                canvas.toBlob((result) => result
                    ? resolve(result)
                    : reject(new Error("Could not capture camera image")),
                "image/jpeg",
                0.92,
                ));
            const file = new File(
                [blob],
                `camera-${Date.now()}.jpg`,
                { type: "image/jpeg" },
            );

            // Freeze the exact encoded image that is handed to the uploader.
            setCapturedPhotoUrl(URL.createObjectURL(file));
            stream.current?.getTracks().forEach((track) => track.stop());
            stream.current = null;

            const controller = new AbortController();
            uploadController.current = controller;
            await onCapture(file, controller.signal);
            onOpenChange(false);
        } catch (captureError) {
            if (captureError instanceof DOMException &&
                captureError.name === "AbortError") return;
            setError(captureError instanceof Error
                ? captureError.message
                : "Taking photo failed");
        } finally {
            uploadController.current = null;
            setIsCapturing(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) uploadController.current?.abort();
        onOpenChange(open);
    };

    return (
        <Dialog open onOpenChange={handleOpenChange}>
            <DialogContent className="h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto_auto] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                <DialogHeader>
                    <DialogTitle>Take photo</DialogTitle>
                    <DialogDescription>
                        Position the stock item in the frame and take a photo.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative min-h-0 overflow-hidden rounded-md bg-black">
                    {capturedPhotoUrl ? (
                        <img
                            src={capturedPhotoUrl}
                            alt="Captured item"
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <video
                            ref={video}
                            autoPlay
                            muted
                            playsInline
                            onPointerUp={(event) => { void focusCamera(event); }}
                            className="h-full w-full cursor-crosshair touch-manipulation object-contain"
                        />
                    )}
                    {focusPoint && (
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-yellow-300 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                            style={{ left: `${focusPoint.left}%`, top: `${focusPoint.top}%` }}
                        />
                    )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                        Cancel
                    </DialogClose>
                    <Button
                        type="button"
                        disabled={Boolean(error) || isCapturing}
                        onClick={() => { void capture(); }}
                    >
                        {isCapturing
                            ? <Loader2 className="animate-spin" />
                            : <Camera />}
                        {isCapturing ? "Saving…" : "Take photo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
