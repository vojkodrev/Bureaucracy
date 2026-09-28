import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedGoodsReceiptGuard(hasUnsavedChanges: boolean) {
    const allowNavigationRef = useRef(false);
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNavigationRef.current &&
        hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search ||
            currentLocation.hash !== nextLocation.hash),
    );

    useEffect(() => {
        if (!hasUnsavedChanges) return;
        const handler = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasUnsavedChanges]);

    return {
        blocker,
        allowNavigation: () => {
            allowNavigationRef.current = true;
        },
        disallowNavigation: () => {
            allowNavigationRef.current = false;
        },
        discardAndNavigate: () => {
            if (blocker.state !== "blocked") return;
            allowNavigationRef.current = true;
            blocker.proceed();
        },
    };
}
