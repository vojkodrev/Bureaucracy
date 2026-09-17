import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type PriceQuoteNumberWarning = {
    kind: 'historical' | 'skipped'
    latestPriceQuoteNumber?: string
}

type Props = {
    quoteNumber: string
    warning: PriceQuoteNumberWarning | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function PriceQuoteNumberAlert({ quoteNumber, warning, onOpenChange, onConfirm }: Props) {
    const skipsNumbers = warning?.kind === 'skipped'
    return <AlertDialog open={warning !== null} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {skipsNumbers ? 'Skip price quote numbers?' : 'Save changes to an earlier price quote?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {skipsNumbers
                        ? <>Price quote {quoteNumber} skips one or more price quote numbers
                            {warning?.latestPriceQuoteNumber
                                ? ` after the latest price quote ${warning.latestPriceQuoteNumber}` : ''}.
                            Please review the number before continuing.</>
                        : <>Price quote {quoteNumber} is not the latest price quote for this business year.
                            Please review the changes carefully before continuing.</>}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>
                    {skipsNumbers ? 'Save and skip numbers' : 'Save historical price quote'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}
