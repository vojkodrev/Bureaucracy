import {
    AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Props = {
    open: boolean
    recordName: string
    identifierLabel: string
    identifier: string
    onOpenChange: (open: boolean) => void
}

export default function DuplicateIdentifierAlert({
    open, recordName, identifierLabel, identifier, onOpenChange,
}: Props) {
    return <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{identifierLabel} already exists</AlertDialogTitle>
                <AlertDialogDescription>
                    A {recordName} with {identifierLabel.toLowerCase()} {identifier} already exists
                    for this business year. Choose a different {identifierLabel.toLowerCase()} before saving.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}
