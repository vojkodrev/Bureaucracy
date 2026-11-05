import UnsavedPriceQuoteAlert from '../price-quote/UnsavedPriceQuoteAlert'

type Props = {
    isNavigationBlocked: boolean
    isConfirmingRevert: boolean
    isConfirmingPrint: boolean
    isConfirmingEmail: boolean
    onCancelNavigation: () => void
    onDiscardAndNavigate: () => void
    onConfirmingRevertChange: (open: boolean) => void
    onDiscardAndRevert: () => void
    onConfirmingPrintChange: (open: boolean) => void
    onSaveBeforePrint: () => void
    onConfirmingEmailChange: (open: boolean) => void
    onSaveBeforeEmail: () => void
}

export default function UnsavedCreditNoteAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    isConfirmingPrint,
    isConfirmingEmail,
    onCancelNavigation,
    onDiscardAndNavigate,
    onConfirmingRevertChange,
    onDiscardAndRevert,
    onConfirmingPrintChange,
    onSaveBeforePrint,
    onConfirmingEmailChange,
    onSaveBeforeEmail,
}: Props) {
    return (
        <>
            <UnsavedPriceQuoteAlert
                open={isNavigationBlocked}
                onOpenChange={(open) => { if (!open) onCancelNavigation() }}
                onDiscard={onDiscardAndNavigate}
                description="This credit note has unsaved changes. If you continue, those changes will be lost."
            />
            <UnsavedPriceQuoteAlert
                open={isConfirmingRevert}
                onOpenChange={onConfirmingRevertChange}
                onDiscard={onDiscardAndRevert}
                actionLabel="Discard and revert"
                description="This credit note has unsaved changes. Reverting will restore its last saved version."
            />
            <UnsavedPriceQuoteAlert
                open={isConfirmingPrint}
                onOpenChange={onConfirmingPrintChange}
                onDiscard={onSaveBeforePrint}
                title="Save before printing?"
                description="This credit note has not been saved with its current values. Save it first so the printed PDF matches the credit note shown here."
                actionLabel="Save credit note"
                actionVariant="default"
            />
            <UnsavedPriceQuoteAlert
                open={isConfirmingEmail}
                onOpenChange={onConfirmingEmailChange}
                onDiscard={onSaveBeforeEmail}
                title="Save before emailing?"
                description="This credit note has not been saved with its current values. Save it first so the emailed PDF matches the credit note shown here."
                actionLabel="Save credit note"
                actionVariant="default"
            />
        </>
    )
}
