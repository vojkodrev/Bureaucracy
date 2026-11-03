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

export type DeliveryNoteNumberWarning = {
    kind: 'duplicate' | 'historical' | 'skipped'
    latestDeliveryNoteNumber?: string
}

type Props = {
    number: string
    warning: DeliveryNoteNumberWarning | null
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export default function DeliveryNoteNumberAlert(props: Props) {
    const duplicate = props.warning?.kind === 'duplicate'
    const skipped = props.warning?.kind === 'skipped'
    const title = duplicate
        ? 'Delivery note number already exists'
        : skipped
            ? 'Skip delivery note numbers?'
            : 'Save an earlier delivery note?'
    const description = duplicate
        ? `Delivery note ${props.number} already exists.`
        : skipped
            ? `Delivery note ${props.number} skips one or more numbers.`
            : `Delivery note ${props.number} is not the latest number.`
    return (
        <AlertDialog
            open={props.warning !== null}
            onOpenChange={props.onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description} Please review it before continuing.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        {duplicate ? 'OK' : 'Keep editing'}
                    </AlertDialogCancel>
                    {!duplicate && (
                        <AlertDialogAction onClick={props.onConfirm}>
                            Save anyway
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
