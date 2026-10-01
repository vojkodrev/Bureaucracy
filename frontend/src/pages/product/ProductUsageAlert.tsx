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

type Props = {
    productCode: string
    invoiceCount: number | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

function ProductUsageAlert({ productCode, invoiceCount, onOpenChange, onConfirm }: Props) {
    return (
        <AlertDialog open={invoiceCount !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Save changes to a used product?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Product {productCode} is already used on {invoiceCount}{' '}
                        {invoiceCount === 1 ? 'invoice' : 'invoices'}. Saving these changes may affect
                        how the product is shown when working with existing invoices. Please review
                        the changes carefully before continuing.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Save product</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ProductUsageAlert
