import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type PriceQuoteNumberWarning = {
    kind: 'duplicate' | 'historical' | 'skipped'
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
    const isDuplicate = warning?.kind === 'duplicate'
    return <AlertDialog open={warning !== null} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {isDuplicate ? 'Price quote number already exists'
                        : skipsNumbers ? 'Skip price quote numbers?' : 'Save changes to an earlier price quote?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {isDuplicate
                        ? <>Price quote {quoteNumber} already exists for this business year.
                            Choose a different price quote number before saving.</>
                        : skipsNumbers
                        ? <>Price quote {quoteNumber} skips one or more price quote numbers
                            {warning?.latestPriceQuoteNumber
                                ? ` after the latest price quote ${warning.latestPriceQuoteNumber}` : ''}.
                            Please review the number before continuing.</>
                        : <>Price quote {quoteNumber} is not the latest price quote for this business year.
                            Please review the changes carefully before continuing.</>}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{isDuplicate ? 'OK' : 'Keep editing'}</AlertDialogCancel>
                {!isDuplicate && <AlertDialogAction onClick={onConfirm}>
                    {skipsNumbers ? 'Save and skip numbers' : 'Save historical price quote'}
                </AlertDialogAction>}
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}
