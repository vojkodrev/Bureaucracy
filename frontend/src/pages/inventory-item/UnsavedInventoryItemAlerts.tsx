import UnsavedInventoryItemAlert from "./UnsavedInventoryItemAlert";

type Props = {
    isNavigationBlocked: boolean;
    isConfirmingRevert: boolean;
    isConfirmingDuplicate: boolean;
    onCancelNavigation: () => void;
    onDiscardAndNavigate: () => void;
    onConfirmingRevertChange: (open: boolean) => void;
    onDiscardAndRevert: () => void;
    onConfirmingDuplicateChange: (open: boolean) => void;
    onDuplicateAnyway: () => void;
};
export default function UnsavedInventoryItemAlerts(props: Props) {
    return (
        <>
            <UnsavedInventoryItemAlert
                open={props.isNavigationBlocked}
                onOpenChange={(open) => {
                    if (!open) props.onCancelNavigation();
                }}
                onDiscard={props.onDiscardAndNavigate}
            />
            <UnsavedInventoryItemAlert
                open={props.isConfirmingRevert}
                onOpenChange={props.onConfirmingRevertChange}
                onDiscard={props.onDiscardAndRevert}
                actionLabel="Discard and revert"
            />
            <UnsavedInventoryItemAlert
                open={props.isConfirmingDuplicate}
                onOpenChange={props.onConfirmingDuplicateChange}
                onDiscard={props.onDuplicateAnyway}
                title="Duplicate with unsaved changes?"
                description="Your changes have not been saved to the original inventory item. The duplicate will use the values currently shown."
                actionLabel="Duplicate anyway"
                actionVariant="default"
            />
        </>
    );
}
