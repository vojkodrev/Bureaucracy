import UnsavedInvoiceAlert from "@/pages/invoice/UnsavedInvoiceAlert";

type Props = {
    isNavigationBlocked: boolean;
    isConfirmingRevert: boolean;
    onCancelNavigation: () => void;
    onDiscardAndNavigate: () => void;
    onConfirmingRevertChange: (open: boolean) => void;
    onDiscardAndRevert: () => void;
};

function UnsavedBankStatementAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    onCancelNavigation,
    onDiscardAndNavigate,
    onConfirmingRevertChange,
    onDiscardAndRevert,
}: Props) {
    return (
        <>
            <UnsavedInvoiceAlert
                open={isNavigationBlocked}
                onOpenChange={(open) => {
                    if (!open) onCancelNavigation();
                }}
                onDiscard={onDiscardAndNavigate}
                title="Discard bank statement changes?"
                description="You have unsaved changes to this bank statement."
            />
            <UnsavedInvoiceAlert
                open={isConfirmingRevert}
                onOpenChange={onConfirmingRevertChange}
                onDiscard={onDiscardAndRevert}
                title="Revert bank statement changes?"
                description="Your unsaved changes will be discarded."
                actionLabel="Discard and revert"
            />
        </>
    );
}

export default UnsavedBankStatementAlerts;
