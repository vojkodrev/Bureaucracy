import { useEffect, useRef, useState } from "react";
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

export default function CameraCaptureDialog({
    onOpenChange,
    onCapture,
}: Props) {
    const video = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream | null>(null);
    const uploadController = useRef<AbortController | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

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
        }).catch((cameraError: unknown) => {
            if (!active) return;
            setError(cameraError instanceof Error
                ? cameraError.message
                : "Camera access failed");
        });
        return () => {
            active = false;
            stream.current?.getTracks().forEach((track) => track.stop());
            uploadController.current?.abort();
        };
    }, []);

    useEffect(() => {
        return () => {
            if (capturedPhotoUrl) URL.revokeObjectURL(capturedPhotoUrl);
        };
    }, [capturedPhotoUrl]);

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
                <div className="min-h-0 overflow-hidden rounded-md bg-black">
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
                            className="h-full w-full object-contain"
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
