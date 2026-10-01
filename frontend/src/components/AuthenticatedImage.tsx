import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth";

type Props = Omit<React.ComponentProps<"img">, "src"> & {
    src: string;
};

export default function AuthenticatedImage({ src, alt, ...props }: Props) {
    const [loaded, setLoaded] = useState<{
        sourceUrl: string;
        objectUrl: string;
    } | null>(null);
    const objectUrl = loaded?.sourceUrl === src ? loaded.objectUrl : undefined;

    useEffect(() => {
        const controller = new AbortController();
        let createdObjectUrl: string | null = null;

        void apiFetch(src, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Image request failed (${response.status}).`);
                }
                createdObjectUrl = URL.createObjectURL(await response.blob());
                setLoaded({ sourceUrl: src, objectUrl: createdObjectUrl });
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error("Loading authenticated image failed", error);
            });

        return () => {
            controller.abort();
            if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
        };
    }, [src]);

    return <img src={objectUrl} alt={alt} {...props} />;
}
