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

export type BankStatementNumberWarning = "historical" | "skipped";

type Props = {
    warning: BankStatementNumberWarning | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

function BankStatementNumberAlert({ warning, onOpenChange, onConfirm }: Props) {
    const skipsNumbers = warning === "skipped";

    return (
        <AlertDialog open={warning !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {skipsNumbers
                            ? "Skip statement numbers?"
                            : "Save an earlier bank statement?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {skipsNumbers
                            ? "This statement number leaves a gap in the sequence for the selected bank account."
                            : "This is not the latest statement for the selected bank account. Saving it will update a historical accounting record."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {skipsNumbers
                            ? "Save and skip numbers"
                            : "Save historical statement"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default BankStatementNumberAlert;
