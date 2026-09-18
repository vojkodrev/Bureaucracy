import { useState } from "react";

type Options = {
    routeStatementNumber: number | null;
    hasUnsavedChanges: boolean;
    isLoading: boolean;
    isSaving: boolean;
    clearSaveError: () => void;
    reload: () => void;
};

export function useBankStatementRevert({
    routeStatementNumber,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    clearSaveError,
    reload,
}: Options) {
    const [confirmingRevert, setConfirmingRevert] = useState(false);
    const canRevert = routeStatementNumber !== null && !isLoading && !isSaving;

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
