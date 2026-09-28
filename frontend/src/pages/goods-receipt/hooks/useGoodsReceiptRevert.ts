import { useState } from "react";

type Options = {
    routeReceiptNumber?: string;
    hasUnsavedChanges: boolean;
    isLoading: boolean;
    isSaving: boolean;
    isDuplicating: boolean;
    clearSaveError: () => void;
    reload: () => void;
};

export function useGoodsReceiptRevert({
    routeReceiptNumber,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    isDuplicating,
    clearSaveError,
    reload,
}: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false);
    const canRevert = Boolean(routeReceiptNumber) &&
        !isLoading &&
        !isSaving &&
        !isDuplicating;

    const performRevert = () => {
        setConfirmingRevert(false);
        clearSaveError();
        reload();
    };
    const requestRevert = () => {
        if (!canRevert) return;
        if (hasUnsavedChanges) setConfirmingRevert(true);
        else performRevert();
    };

    return {
        canRevert,
        confirmingRevert,
        setConfirmingRevert,
        requestRevert,
        performRevert,
    };
}
