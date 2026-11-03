import type { ComponentProps } from 'react'
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
import type { Button } from '@/components/ui/button'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAction: () => void
    actionLabel: string
    title: string
    description: string
    actionVariant?: ComponentProps<typeof Button>['variant']
}

export default function DeliveryNoteAlert(props: Props) {
    return (
        <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{props.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {props.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                    <AlertDialogAction
                        variant={props.actionVariant ?? 'destructive'}
                        onClick={props.onAction}
                    >
                        {props.actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
