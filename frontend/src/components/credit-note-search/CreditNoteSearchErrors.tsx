import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function CreditNoteSearchErrors({ error }: { error: string | null }) {
    if (!error) return null
    return (
        <Alert variant="destructive" className="mb-4 max-w-6xl">
            <AlertTitle>Credit note search failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
}
