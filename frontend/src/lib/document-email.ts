import { getSelectedBusinessYear } from '@/lib/business-year'

export type DocumentEmailFields = {
    recipient: string
    bcc: string
    subject: string
    message: string
    attachments: File[]
}

type ErrorResponse = { error?: string }
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function sendDocumentEmail(
    resource: 'invoices' | 'price-quotes',
    documentNumber: string,
    fields: DocumentEmailFields,
): Promise<void> {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/${resource}/${encodeURIComponent(documentNumber)}/email`
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.hash = ''
    const form = new FormData()
    form.set('recipient', fields.recipient)
    form.set('bcc', fields.bcc)
    form.set('subject', fields.subject)
    form.set('message', fields.message)
    fields.attachments.forEach((file) => form.append('attachments', file, file.name))
    const response = await fetch(url, { method: 'POST', body: form })
    const result = await response.json() as ErrorResponse
    if (!response.ok) throw new Error(result.error || `Sending email failed (${response.status})`)
}
