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

export enum BankStatementNumberWarning {
    Duplicate = "duplicate",
    Historical = "historical",
    Skipped = "skipped",
}

type Props = {
    warning: BankStatementNumberWarning | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

function BankStatementNumberAlert({ warning, onOpenChange, onConfirm }: Props) {
    const skipsNumbers = warning === BankStatementNumberWarning.Skipped;
    const isDuplicate = warning === BankStatementNumberWarning.Duplicate;

    return (
        <AlertDialog open={warning !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isDuplicate
                            ? "Statement number already exists"
                            : skipsNumbers
                            ? "Skip statement numbers?"
                            : "Save an earlier bank statement?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isDuplicate
                            ? "A bank statement with this number already exists for this business year. Choose a different statement number before saving."
                            : skipsNumbers
                            ? "This statement number leaves a gap in the sequence for this business year."
                            : "This statement date is earlier than another statement in this business year. Saving it will update a historical accounting record."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{isDuplicate ? "OK" : "Keep editing"}</AlertDialogCancel>
                    {!isDuplicate && <AlertDialogAction onClick={onConfirm}>
                        {skipsNumbers
                            ? "Save and skip numbers"
                            : "Save historical statement"}
                    </AlertDialogAction>}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default BankStatementNumberAlert;
