import UnsavedProductAlert from './UnsavedProductAlert'

type Props = {
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

function UnsavedProductAlerts({
    isNavigationBlocked,
    isConfirmingRevert,
    isConfirmingDuplicate,
    onCancelNavigation,
    onDiscardAndNavigate,
    onConfirmingRevertChange,
    onDiscardAndRevert,
    onConfirmingDuplicateChange,
    onDuplicateAnyway,
}: Props) {
    return (
        <>
            <UnsavedProductAlert
                open={isNavigationBlocked}
                onOpenChange={(open) => { if (!open) onCancelNavigation() }}
                onDiscard={onDiscardAndNavigate}
            />
            <UnsavedProductAlert
                open={isConfirmingRevert}
                onOpenChange={onConfirmingRevertChange}
                onDiscard={onDiscardAndRevert}
                actionLabel="Discard and revert"
            />
            <UnsavedProductAlert
                open={isConfirmingDuplicate}
                onOpenChange={onConfirmingDuplicateChange}
                onDiscard={onDuplicateAnyway}
                title="Duplicate with unsaved changes?"
                description="Your changes have not been saved to the original product. The new duplicate will be created from the values currently shown."
                actionLabel="Duplicate anyway"
                actionVariant="default"
            />
        </>
    )
}

export default UnsavedProductAlerts
