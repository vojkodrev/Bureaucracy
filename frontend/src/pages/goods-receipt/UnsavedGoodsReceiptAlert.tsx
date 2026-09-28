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
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDiscard: () => void;
    actionLabel?: string;
    title?: string;
    description?: string;
    actionVariant?: "default" | "destructive";
};

export default function UnsavedGoodsReceiptAlert({
    open,
    onOpenChange,
    onDiscard,
    actionLabel = "Leave without saving",
    title = "Discard unsaved changes?",
    description = "This goods receipt has changes that have not been saved. " +
        "If you continue, those changes will be lost.",
    actionVariant = "destructive",
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction
                        variant={actionVariant}
                        onClick={onDiscard}
                    >
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
