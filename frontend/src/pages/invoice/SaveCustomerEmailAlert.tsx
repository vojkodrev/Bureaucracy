import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { toast } from '@/lib/toast'

type UpdateCustomerEmailResponse = {
    data?: { updateCustomerEmail: { id: number; email: string | null } }
    errors?: { message: string }[]
}

type Props = {
    email: string | null
    customerId: string
    customerName: string
    onOpenChange: (open: boolean) => void
}

const updateCustomerEmailMutation = `
    mutation UpdateCustomerEmail(
        $businessYear: String!
        $customerId: String!
        $email: String!
    ) {
        updateCustomerEmail(
            businessYear: $businessYear
            customerId: $customerId
            email: $email
        ) { id email }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function SaveCustomerEmailAlert({
    email,
    customerId,
    customerName,
    onOpenChange,
}: Props) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const saveEmail = async () => {
        if (!email || saving) return
        setSaving(true)
        setError(null)
        try {
            const businessYear = getSelectedBusinessYear()
            const response = await fetch(graphqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: updateCustomerEmailMutation,
                    variables: { businessYear, customerId, email },
                }),
            })
            if (!response.ok) {
                throw new Error(`Saving customer email failed (${response.status})`)
            }
            const result = await response.json() as UpdateCustomerEmailResponse
            if (result.errors?.length) {
                throw new Error(result.errors.map(({ message }) => message).join(', '))
            }
            if (!result.data?.updateCustomerEmail) {
                throw new Error('Saving customer email returned no customer')
            }
            toast.add({
                title: 'Customer email saved',
                description: `${email} was saved to customer ${customerId}.`,
                type: 'success',
            })
            onOpenChange(false)
        } catch (requestError: unknown) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Saving customer email failed',
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <AlertDialog
            open={email !== null}
            onOpenChange={(open) => {
                if (!saving) onOpenChange(open)
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Save email to customer?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to save email {email} to customer {customerId}
                        {customerName ? ` — ${customerName}` : ''}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={saving}>No, keep current email</AlertDialogCancel>
                    <Button disabled={saving} onClick={() => void saveEmail()}>
                        {saving ? 'Saving…' : 'Yes, save email'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default SaveCustomerEmailAlert
