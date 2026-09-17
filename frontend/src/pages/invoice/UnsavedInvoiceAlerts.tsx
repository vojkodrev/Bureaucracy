import UnsavedInvoiceAlert from './UnsavedInvoiceAlert'

type UnsavedInvoiceAlertsProps = {
    isNavigationBlocked: boolean
    isConfirmingRevert: boolean
    isConfirmingDuplicate: boolean
    isConfirmingPrint: boolean
    isConfirmingEmail: boolean
    onCancelNavigation: () => void
    onDiscardAndNavigate: () => void
    onConfirmingRevertChange: (open: boolean) => void
    onDiscardAndRevert: () => void
    onConfirmingDuplicateChange: (open: boolean) => void
    onDuplicateAnyway: () => void
    onConfirmingPrintChange: (open: boolean) => void
    onSaveBeforePrint: () => void
    onConfirmingEmailChange: (open: boolean) => void
    onSaveBeforeEmail: () => void
}

function UnsavedInvoiceAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    isConfirmingDuplicate,
    isConfirmingPrint,
    isConfirmingEmail,
    onCancelNavigation,
    onDiscardAndNavigate,
    onConfirmingRevertChange,
    onDiscardAndRevert,
    onConfirmingDuplicateChange,
    onDuplicateAnyway,
    onConfirmingPrintChange,
    onSaveBeforePrint,
    onConfirmingEmailChange,
    onSaveBeforeEmail,
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
            <UnsavedInvoiceAlert
                open={isConfirmingPrint}
                onOpenChange={onConfirmingPrintChange}
                onDiscard={onSaveBeforePrint}
                title="Save before printing?"
                description="This invoice has not been saved with its current values. Save it first so the printed PDF matches the invoice shown here."
                actionLabel="Save invoice"
                actionVariant="default"
            />
            <UnsavedInvoiceAlert
                open={isConfirmingEmail}
                onOpenChange={onConfirmingEmailChange}
                onDiscard={onSaveBeforeEmail}
                title="Save before emailing?"
                description="This invoice has not been saved with its current values. Save it first so the emailed PDF matches the invoice shown here."
                actionLabel="Save invoice"
                actionVariant="default"
            />
        </>
    )
}

export default UnsavedInvoiceAlerts
