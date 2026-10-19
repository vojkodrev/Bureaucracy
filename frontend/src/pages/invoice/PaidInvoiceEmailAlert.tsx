import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type PaidInvoiceEmailAlertProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

function PaidInvoiceEmailAlert({ open, onOpenChange, onConfirm }: PaidInvoiceEmailAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Email a fully paid invoice?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This invoice has already been paid in full. Do you still want to email it?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default PaidInvoiceEmailAlert
