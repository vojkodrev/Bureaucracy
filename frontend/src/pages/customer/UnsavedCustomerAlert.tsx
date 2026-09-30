import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UnsavedCustomerAlertProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDiscard: () => void
    actionLabel?: string
    title?: string
    description?: string
    actionVariant?: 'default' | 'destructive'
}

function UnsavedCustomerAlert({
    open,
    onOpenChange,
    onDiscard,
    actionLabel = 'Leave without saving',
    title = 'Discard unsaved changes?',
    description = 'This customer has changes that have not been saved. If you continue, those changes will be lost.',
    actionVariant = 'destructive',
}: UnsavedCustomerAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction variant={actionVariant} onClick={onDiscard}>{actionLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnsavedCustomerAlert
