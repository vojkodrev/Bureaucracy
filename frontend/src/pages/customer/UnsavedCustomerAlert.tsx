import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UnsavedCustomerAlertProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDiscard: () => void
    actionLabel?: string
}

function UnsavedCustomerAlert({ open, onOpenChange, onDiscard, actionLabel = 'Leave without saving' }: UnsavedCustomerAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This customer has changes that have not been saved. If you continue, those changes will be lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDiscard}>{actionLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnsavedCustomerAlert
