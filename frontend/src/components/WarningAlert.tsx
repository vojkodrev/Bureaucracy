import { TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type WarningAlertProps = {
    title: string
    description: string
    warning: string
}

function WarningAlert({ title, description, warning }: WarningAlertProps) {
    return (
        <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description} {warning}
            </AlertDescription>
        </Alert>
    )
}

export default WarningAlert
