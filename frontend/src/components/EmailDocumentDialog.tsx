import { useEffect, useRef, useState } from 'react'
import { FileText, Paperclip, Trash2 } from 'lucide-react'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getSelectedBusinessYear } from '@/lib/business-year'
import type { DocumentEmailFields } from '@/lib/document-email'

type CustomerEmailResponse = { data?: { customer: { email: string | null } | null }; errors?: { message: string }[] }
type Props = {
    open: boolean
    documentName: string
    customerId: string
    businessYear: number | null
    defaultSubject: string
    defaultMessage: string
    onOpenChange: (open: boolean) => void
    onOfferSaveCustomerEmail: (email: string) => void
    onSend: (fields: DocumentEmailFields) => Promise<void>
}

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const acceptedTypes = '.pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx'
const customerEmailQuery = `
    query CustomerEmail($businessYear: String!, $customerId: String!) {
        customer(businessYear: $businessYear, customerId: $customerId) { email }
    }
`

function EmailDocumentDialog({
    open,
    documentName,
    customerId,
    businessYear,
    defaultSubject,
    defaultMessage,
    onOpenChange,
    onOfferSaveCustomerEmail,
    onSend,
}: Props) {
    const pickerRef = useRef<HTMLInputElement>(null)
    const [storedRecipient, setStoredRecipient] = useState('')
    const [recipient, setRecipient] = useState('')
    const [bcc, setBcc] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [attachments, setAttachments] = useState<File[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        const controller = new AbortController()
        setStoredRecipient('')
        setRecipient('')
        setBcc('')
        setSubject(defaultSubject)
        setMessage(defaultMessage)
        setError(null); setAttachments([])
        if (!customerId.trim()) { setLoading(false); return }
        setLoading(true)
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: customerEmailQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    customerId: customerId.trim(),
                },
            }),
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Loading customer email failed (${response.status})`)
                const result = await response.json() as CustomerEmailResponse
                if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
                const email = result.data?.customer?.email?.trim() ?? ''
                setStoredRecipient(email); setRecipient(email)
            })
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : 'Loading customer email failed',
                    )
                }
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false) })
        return () => controller.abort()
    }, [businessYear, customerId, defaultMessage, defaultSubject, open])

    const addAttachments = (files: FileList | null) => {
        if (!files) return
        const next = [...attachments, ...Array.from(files)]
        if (next.length > 5) { setError('You can add at most 5 additional attachments.'); return }
        const oversized = next.find((file) => file.size > 5 * 1024 * 1024)
        if (oversized) { setError(`${oversized.name} is larger than 5 MiB.`); return }
        if (next.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) {
            setError('Additional attachments must total at most 20 MiB.')
            return
        }
        setError(null); setAttachments(next)
        if (pickerRef.current) pickerRef.current.value = ''
    }

    const send = async () => {
        if (sending || loading) return
        setSending(true); setError(null)
        try {
            await onSend({ recipient: recipient.trim(), bcc: bcc.trim(),
                subject: subject.trim(), message: message.trim(), attachments })
            onOpenChange(false)
            if (customerId.trim() &&
                recipient.trim().toLowerCase() !== storedRecipient.trim().toLowerCase()) {
                onOfferSaveCustomerEmail(recipient.trim())
            }
        } catch (requestError: unknown) {
            setError(requestError instanceof Error ? requestError.message : 'Sending email failed')
        } finally { setSending(false) }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!sending) onOpenChange(next) }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Email {documentName}</DialogTitle>
                    <DialogDescription>
                        The generated {documentName} PDF is always included.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="document-email-recipient">Recipient</FieldLabel>
                        <Input
                            id="document-email-recipient"
                            type="email"
                            value={recipient}
                            disabled={loading || sending}
                            onChange={(event) => setRecipient(event.target.value)}
                            placeholder="customer@example.com"
                        />
                    </Field>
                    {!loading && !storedRecipient && (
                        <p className="text-sm text-muted-foreground">
                            No email is stored for this customer. Enter a recipient manually.
                        </p>
                    )}
                    <Field>
                        <FieldLabel htmlFor="document-email-bcc">BCC copy</FieldLabel>
                        <Input
                            id="document-email-bcc"
                            type="email"
                            value={bcc}
                            disabled={loading || sending}
                            onChange={(event) => setBcc(event.target.value)}
                            placeholder="copy@example.com"
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="document-email-subject">Subject</FieldLabel>
                        <Input
                            id="document-email-subject"
                            value={subject}
                            disabled={loading || sending}
                            maxLength={200}
                            onChange={(event) => setSubject(event.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="document-email-message">Message</FieldLabel>
                        <Textarea
                            id="document-email-message"
                            value={message}
                            disabled={loading || sending}
                            maxLength={10000}
                            rows={6}
                            onChange={(event) => setMessage(event.target.value)}
                        />
                    </Field>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Attachments</p>
                        <div className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                            <FileText className="size-4" />
                            <span className="min-w-0 flex-1 truncate">
                                Generated {documentName} PDF
                            </span>
                            <span className="text-xs text-muted-foreground">Required</span>
                        </div>
                        {attachments.map((file, index) => (
                            <div
                                key={`${file.name}-${file.size}-${index}`}
                                className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                            >
                                <Paperclip className="size-4" />
                                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    disabled={sending}
                                    aria-label={`Remove ${file.name}`}
                                    onClick={() => setAttachments((current) =>
                                        current.filter((_, itemIndex) => itemIndex !== index))}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        ))}
                        <Input
                            ref={pickerRef}
                            type="file"
                            multiple
                            accept={acceptedTypes}
                            disabled={loading || sending || attachments.length >= 5}
                            onChange={(event) => addAttachments(event.target.files)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Up to 5 additional files, 5 MiB each (PDF, images, text/CSV,
                            Word, or Excel).
                        </p>
                    </div>
                    {error && (
                        <ErrorAlert
                            title={`${documentName[0].toUpperCase()}${documentName.slice(1)} email could not be completed`}
                            description="Review the email details and try again."
                            error={error}
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={sending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={loading || sending || !recipient.trim() ||
                            !subject.trim() || !message.trim()}
                        onClick={() => void send()}
                    >
                        {sending ? 'Sending…' : 'Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default EmailDocumentDialog
