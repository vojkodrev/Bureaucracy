import UnsavedInvoiceAlert from './UnsavedInvoiceAlert'

type UnsavedInvoiceAlertsProps = {
    isNavigationBlocked: boolean
    isConfirmingRevert: boolean
    isConfirmingDuplicate: boolean
    isConfirmingPrint: boolean
    isConfirmingEmail: boolean
    isConfirmingXmlExport: boolean
    isConfirmingHalcomExport: boolean
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
    onConfirmingXmlExportChange: (open: boolean) => void
    onSaveBeforeXmlExport: () => void
    onConfirmingHalcomExportChange: (open: boolean) => void
    onSaveBeforeHalcomExport: () => void
}

function UnsavedInvoiceAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    isConfirmingDuplicate,
    isConfirmingPrint,
    isConfirmingEmail,
    isConfirmingXmlExport,
    isConfirmingHalcomExport,
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
    onConfirmingXmlExportChange,
    onSaveBeforeXmlExport,
    onConfirmingHalcomExportChange,
    onSaveBeforeHalcomExport,
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
            <UnsavedInvoiceAlert
                open={isConfirmingXmlExport}
                onOpenChange={onConfirmingXmlExportChange}
                onDiscard={onSaveBeforeXmlExport}
                title="Save before exporting XML?"
                description="This invoice has not been saved with its current values. Save it first so the exported XML matches the invoice shown here."
                actionLabel="Save invoice"
                actionVariant="default"
            />
            <UnsavedInvoiceAlert
                open={isConfirmingHalcomExport}
                onOpenChange={onConfirmingHalcomExportChange}
                onDiscard={onSaveBeforeHalcomExport}
                title="Save before exporting for Halcom?"
                description="This invoice has not been saved with its current values. Save it first so the exported PDF and XML match the invoice shown here."
                actionLabel="Save invoice"
                actionVariant="default"
            />
        </>
    )
}

export default UnsavedInvoiceAlerts
