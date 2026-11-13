import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TriangleAlertIcon } from 'lucide-react'

type Props = {
    open: boolean
    pending: boolean
    alreadyConfirmed: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function TaxConfirmationAlert({ open, pending, alreadyConfirmed, onOpenChange, onConfirm }: Props) {
    return <AlertDialog open={open} onOpenChange={(value) => { if (!pending) onOpenChange(value) }}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Tax confirm this invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                    The saved invoice will be signed and sent to FURS. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            {alreadyConfirmed && (
                <Alert variant="warning">
                    <TriangleAlertIcon />
                    <AlertTitle>Invoice already tax confirmed</AlertTitle>
                    <AlertDescription>
                        This invoice already has ZOI and EOR values and cannot be tax confirmed again.
                    </AlertDescription>
                </Alert>
            )}
            <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>No</AlertDialogCancel>
                <AlertDialogAction disabled={pending || alreadyConfirmed}
                    onClick={(event) => { event.preventDefault(); onConfirm() }}>
                    {pending ? 'Confirming…' : 'Yes'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}
