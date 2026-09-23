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

export type InvoiceNumberWarning = {
    kind: 'duplicate' | 'historical' | 'skipped'
    latestInvoiceNumber?: string
}

type InvoiceNumberAlertProps = {
    invoiceNumber: string
    warning: InvoiceNumberWarning | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

function InvoiceNumberAlert({
    invoiceNumber,
    warning,
    onOpenChange,
    onConfirm,
}: InvoiceNumberAlertProps) {
    const skipsNumbers = warning?.kind === 'skipped'
    const isDuplicate = warning?.kind === 'duplicate'

    return (
        <AlertDialog
            open={warning !== null}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isDuplicate
                            ? 'Invoice number already exists'
                            : skipsNumbers
                            ? 'Skip invoice numbers?'
                            : 'Save changes to an earlier invoice?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isDuplicate ? (
                            <>
                                Invoice {invoiceNumber} already exists for this
                                business year. Choose a different invoice number
                                before saving.
                            </>
                        ) : skipsNumbers ? (
                            <>
                                Invoice {invoiceNumber} skips one or more
                                invoice numbers
                                {warning?.latestInvoiceNumber
                                    ? ` after the latest invoice ${warning.latestInvoiceNumber}`
                                    : ''}. Saving it will leave a gap in the
                                invoice sequence. Please review the invoice
                                number before continuing.
                            </>
                        ) : (
                            <>
                                Invoice {invoiceNumber} is not the latest
                                invoice for this business year. Saving it will
                                update a historical record. Please review the
                                changes carefully before continuing.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{isDuplicate ? 'OK' : 'Keep editing'}</AlertDialogCancel>
                    {!isDuplicate && (
                        <AlertDialogAction onClick={onConfirm}>
                            {skipsNumbers
                                ? 'Save and skip numbers'
                                : 'Save historical invoice'}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default InvoiceNumberAlert
