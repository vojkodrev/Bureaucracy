import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type RemoveProductAlertProps = { productName: string; onRemove: () => void }

function RemoveProductAlert({ productName, onRemove }: RemoveProductAlertProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${productName}`} />}><Trash2 /></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove product?</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to remove {productName} from the invoice?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onRemove}>Remove</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default RemoveProductAlert
