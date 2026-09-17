import UnsavedPriceQuoteAlert from './UnsavedPriceQuoteAlert'

type Props = {
    isNavigationBlocked: boolean
    isConfirmingRevert: boolean
    isConfirmingDuplicate: boolean
    isConfirmingPrint: boolean
    onCancelNavigation: () => void
    onDiscardAndNavigate: () => void
    onConfirmingRevertChange: (open: boolean) => void
    onDiscardAndRevert: () => void
    onConfirmingDuplicateChange: (open: boolean) => void
    onDuplicateAnyway: () => void
    onConfirmingPrintChange: (open: boolean) => void
    onSaveBeforePrint: () => void
}

export default function UnsavedPriceQuoteAlerts(props: Props) {
    return <>
        <UnsavedPriceQuoteAlert open={props.isNavigationBlocked}
            onOpenChange={(open) => { if (!open) props.onCancelNavigation() }}
            onDiscard={props.onDiscardAndNavigate} />
        <UnsavedPriceQuoteAlert open={props.isConfirmingRevert}
            onOpenChange={props.onConfirmingRevertChange} onDiscard={props.onDiscardAndRevert}
            actionLabel="Discard and revert" />
        <UnsavedPriceQuoteAlert open={props.isConfirmingDuplicate}
            onOpenChange={props.onConfirmingDuplicateChange} onDiscard={props.onDuplicateAnyway}
            title="Duplicate with unsaved changes?"
            description="Your changes have not been saved to the original price quote. The new duplicate will be created from the values currently shown."
            actionLabel="Duplicate anyway" />
        <UnsavedPriceQuoteAlert open={props.isConfirmingPrint}
            onOpenChange={props.onConfirmingPrintChange} onDiscard={props.onSaveBeforePrint}
            title="Save before printing?"
            description="This price quote has not been saved with its current values. Save it first so the printed PDF matches the price quote shown here."
            actionLabel="Save price quote" actionVariant="default" />
    </>
}
