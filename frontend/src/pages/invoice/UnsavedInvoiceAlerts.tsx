import UnsavedInvoiceAlert from './UnsavedInvoiceAlert'

type UnsavedInvoiceAlertsProps = {
    isNavigationBlocked: boolean
    isConfirmingRevert: boolean
    isConfirmingDuplicate: boolean
    onCancelNavigation: () => void
    onDiscardAndNavigate: () => void
    onConfirmingRevertChange: (open: boolean) => void
    onDiscardAndRevert: () => void
    onConfirmingDuplicateChange: (open: boolean) => void
    onDuplicateAnyway: () => void
}

function UnsavedInvoiceAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    isConfirmingDuplicate,
    onCancelNavigation,
    onDiscardAndNavigate,
    onConfirmingRevertChange,
    onDiscardAndRevert,
    onConfirmingDuplicateChange,
    onDuplicateAnyway,
}: UnsavedInvoiceAlertsProps) {
    return (
        <>
            <UnsavedInvoiceAlert
                open={isNavigationBlocked}
                onOpenChange={(open) => { if (!open) onCancelNavigation() }}
                onDiscard={onDiscardAndNavigate}
            />
            <UnsavedInvoiceAlert
                open={isConfirmingRevert}
                onOpenChange={onConfirmingRevertChange}
                onDiscard={onDiscardAndRevert}
                actionLabel="Discard and revert"
            />
            <UnsavedInvoiceAlert
                open={isConfirmingDuplicate}
                onOpenChange={onConfirmingDuplicateChange}
                onDiscard={onDuplicateAnyway}
                title="Duplicate with unsaved changes?"
                description="Your changes have not been saved to the original invoice. The new duplicate will be created from the values currently shown."
                actionLabel="Duplicate anyway"
            />
        </>
    )
}

export default UnsavedInvoiceAlerts
