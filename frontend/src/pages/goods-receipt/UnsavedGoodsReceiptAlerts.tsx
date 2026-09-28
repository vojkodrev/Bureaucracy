import UnsavedGoodsReceiptAlert from "./UnsavedGoodsReceiptAlert";

type Props = {
    isNavigationBlocked: boolean;
    isConfirmingRevert: boolean;
    onCancelNavigation: () => void;
    onDiscardAndNavigate: () => void;
    onConfirmingRevertChange: (open: boolean) => void;
    onDiscardAndRevert: () => void;
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
