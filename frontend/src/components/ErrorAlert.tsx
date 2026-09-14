import { CircleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ErrorAlertProps = {
    title: string
    description: string
    error: string
}

function ErrorAlert({ title, description, error }: ErrorAlertProps) {
    return (
        <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {description} {error}
            </AlertDescription>
        </Alert>
    )
}

export default ErrorAlert
