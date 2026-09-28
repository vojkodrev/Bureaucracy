import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
    productCode: string;
    goodsReceiptCount: number | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function InventoryItemUsageAlert({
    productCode,
    goodsReceiptCount,
    onOpenChange,
    onConfirm,
}: Props) {
    return (
        <AlertDialog
            open={goodsReceiptCount !== null}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Save changes to a used inventory item?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Inventory item {productCode} is already used on{" "}
                        {goodsReceiptCount}{" "}
                        {goodsReceiptCount === 1
                            ? "goods receipt"
                            : "goods receipts"}. Saving these changes may affect
                        how the inventory item is shown when working with
                        existing goods receipts. Please review the changes
                        carefully before continuing.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Save inventory item
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
