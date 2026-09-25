import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type UnavailableRemindersAlertProps = {
    action: 'print' | 'email' | null
    description: string
    onOpenChange: (open: boolean) => void
}

function UnavailableRemindersAlert({
    action,
    description,
    onOpenChange,
}: UnavailableRemindersAlertProps) {
    return (
        <AlertDialog open={action !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Reminders cannot be {action === 'email' ? 'emailed' : 'printed'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnavailableRemindersAlert
