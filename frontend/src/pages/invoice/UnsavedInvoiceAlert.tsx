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

type UnsavedInvoiceAlertProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDiscard: () => void
    actionLabel?: string
    title?: string
    description?: string
}

function UnsavedInvoiceAlert({
    open,
    onOpenChange,
    onDiscard,
    actionLabel = 'Leave without saving',
    title = 'Discard unsaved changes?',
    description = 'This invoice has changes that have not been saved. If you continue, those changes will be lost.',
}: UnsavedInvoiceAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDiscard}>
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnsavedInvoiceAlert
