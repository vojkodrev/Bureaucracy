import { useEffect, useEffectEvent } from "react";

export function useBankStatementKeyboardShortcuts(onSave: () => void) {
    const save = useEffectEvent(onSave);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
            event.preventDefault();
            save();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
}
