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
    kind: 'historical' | 'skipped'
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

    return (
        <AlertDialog
            open={warning !== null}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {skipsNumbers
                            ? 'Skip invoice numbers?'
                            : 'Save changes to an earlier invoice?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {skipsNumbers ? (
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
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {skipsNumbers
                            ? 'Save and skip numbers'
                            : 'Save historical invoice'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default InvoiceNumberAlert
