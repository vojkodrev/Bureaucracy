import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Props = { open: boolean; pending: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }

export default function TaxConfirmationAlert({ open, pending, onOpenChange, onConfirm }: Props) {
    return <AlertDialog open={open} onOpenChange={(value) => { if (!pending) onOpenChange(value) }}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Tax confirm this invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                    The saved invoice will be signed and sent to FURS. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>No</AlertDialogCancel>
                <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); onConfirm() }}>
                    {pending ? 'Confirming…' : 'Yes'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}
