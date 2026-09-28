import UnsavedGoodsReceiptAlert from "./UnsavedGoodsReceiptAlert";

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

export default function UnsavedGoodsReceiptAlerts(props: Props) {
    return (
        <>
            <UnsavedGoodsReceiptAlert
                open={props.isNavigationBlocked}
                onOpenChange={(open) => {
                    if (!open) props.onCancelNavigation();
                }}
                onDiscard={props.onDiscardAndNavigate}
            />
            <UnsavedGoodsReceiptAlert
                open={props.isConfirmingDuplicate}
                onOpenChange={props.onConfirmingDuplicateChange}
                onDiscard={props.onDuplicateAnyway}
                title="Duplicate with unsaved changes?"
                description={
                    "Your changes have not been saved to the original goods " +
                    "receipt. The new duplicate will use the values currently " +
                    "shown."
                }
                actionLabel="Duplicate anyway"
                actionVariant="default"
            />
            <UnsavedGoodsReceiptAlert
                open={props.isConfirmingRevert}
                onOpenChange={props.onConfirmingRevertChange}
                onDiscard={props.onDiscardAndRevert}
                actionLabel="Discard and revert"
                description={
                    "The goods receipt will be restored to its last saved " +
                    "version."
                }
            />
        </>
    );
}
