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
    onCapture: (file: File) => Promise<void>;
};

export default function CameraCaptureDialog({
    onOpenChange,
    onCapture,
}: Props) {
    const video = useRef<HTMLVideoElement>(null);
    const stream = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

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
        };
    }, []);

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
            await onCapture(new File(
                [blob],
                `camera-${Date.now()}.jpg`,
                { type: "image/jpeg" },
            ));
            onOpenChange(false);
        } catch (captureError) {
            setError(captureError instanceof Error
                ? captureError.message
                : "Taking photo failed");
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Take photo</DialogTitle>
                    <DialogDescription>
                        Position the stock item in the frame and take a photo.
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-hidden rounded-md bg-black">
                    <video
                        ref={video}
                        autoPlay
                        muted
                        playsInline
                        className="max-h-[65vh] w-full object-contain"
                    />
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
