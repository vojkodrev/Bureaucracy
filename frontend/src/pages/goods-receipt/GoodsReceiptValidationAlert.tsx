import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
    issues: string[];
    onOpenChange: (open: boolean) => void;
};

export default function GoodsReceiptValidationAlert({
    issues,
    onOpenChange,
}: Props) {
    return (
        <AlertDialog
            open={issues.length > 0}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Goods receipt cannot be saved
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Complete the following before saving:
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                    ))}
                </ul>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
