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
import type { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'

type UnsavedInvoiceAlertProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDiscard: () => void
    actionLabel?: string
    title?: string
    description?: string
    actionVariant?: ComponentProps<typeof Button>['variant']
}

function UnsavedInvoiceAlert({
    open,
    onOpenChange,
    onDiscard,
    actionLabel = 'Leave without saving',
    title = 'Discard unsaved changes?',
    description = 'This invoice has changes that have not been saved. If you continue, those changes will be lost.',
    actionVariant = 'destructive',
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
                    <AlertDialogAction variant={actionVariant} onClick={onDiscard}>
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnsavedInvoiceAlert
