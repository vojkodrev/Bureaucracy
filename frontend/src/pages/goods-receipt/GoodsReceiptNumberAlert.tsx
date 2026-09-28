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

export type GoodsReceiptNumberWarning = {
    kind: "duplicate" | "historical" | "skipped";
    latestReceiptNumber?: string;
};

type Props = {
    receiptNumber: string;
    warning: GoodsReceiptNumberWarning | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function GoodsReceiptNumberAlert({
    receiptNumber,
    warning,
    onOpenChange,
    onConfirm,
}: Props) {
    const duplicate = warning?.kind === "duplicate";
    const skipped = warning?.kind === "skipped";

    return (
        <AlertDialog
            open={warning !== null}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {duplicate
                            ? "Goods receipt number already exists"
                            : skipped
                            ? "Skip goods receipt numbers?"
                            : "Save changes to an earlier goods receipt?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {duplicate ? (
                            <>
                                Goods receipt {receiptNumber} already exists
                                for this business year. Choose a different
                                receipt number before saving.
                            </>
                        ) : skipped ? (
                            <>
                                Goods receipt {receiptNumber} skips one or more
                                receipt numbers after the latest receipt
                                {warning?.latestReceiptNumber
                                    ? ` ${warning.latestReceiptNumber}`
                                    : ""}. Saving it will leave a gap in the
                                receipt sequence.
                            </>
                        ) : (
                            <>
                                Goods receipt {receiptNumber} is not the latest
                                receipt for this business year. Saving it will
                                update a historical record. Please review the
                                changes carefully before continuing.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        {duplicate ? "OK" : "Keep editing"}
                    </AlertDialogCancel>
                    {!duplicate && (
                        <AlertDialogAction onClick={onConfirm}>
                            {skipped
                                ? "Save and skip numbers"
                                : "Save historical goods receipt"}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
