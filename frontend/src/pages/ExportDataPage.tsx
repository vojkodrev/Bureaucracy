import { useState } from 'react'
import { apiFetch } from '@/lib/auth'
import type { FormEvent } from 'react'
import { Download, Mail } from 'lucide-react'
import ErrorAlert from '@/components/ErrorAlert'
import EmailDocumentDialog from '@/components/EmailDocumentDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { sendAccountingExportEmail } from '@/lib/document-email'
import { toast } from '@/lib/toast'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const months = monthNames.map((label, index) => ({
    label,
    value: String(index + 1),
}))
const invoiceNumberPattern = /^\d{5}$/

function filterError(month: (typeof months)[number] | null, year: string, numberFrom: string, numberTo: string): string | null {
    if (!/^\d{1,4}$/.test(year) || Number(year) < 1) return 'Year is required'
    if (!month && !numberFrom && !numberTo) return 'Select a month or enter number from or number to'
    if ((numberFrom && !invoiceNumberPattern.test(numberFrom)) || (numberTo && !invoiceNumberPattern.test(numberTo))) {
        return 'Invoice numbers must contain exactly 5 digits, including leading zeros'
    }
    if (numberFrom && numberTo && numberFrom > numberTo) return 'Number from must not be greater than number to'
    return null
}

function exportUrl(month: string, year: string, numberFrom: string, numberTo: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/exports/accounting'
    url.search = new URLSearchParams({ month, year, numberFrom, numberTo }).toString()
    url.hash = ''
    return url.toString()
}

function downloadFilename(response: Response, year: string, month: string): string {
    const disposition = response.headers.get('Content-Disposition') ?? ''
    const match = disposition.match(/filename="([^"]+)"/)
    return match?.[1] ?? `izvoz-${year}-${month.padStart(2, '0')}.txt`
}

function ExportDataPage() {
    const today = new Date()
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1)
    const [month, setMonth] = useState<(typeof months)[number] | null>(months[previousMonth.getMonth()])
    const [year, setYear] = useState(String(previousMonth.getFullYear()))
    const [numberFrom, setNumberFrom] = useState('')
    const [numberTo, setNumberTo] = useState('')
    const [isExporting, setIsExporting] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function exportData(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const selectedMonth = month
        const validationError = filterError(selectedMonth, year, numberFrom.trim(), numberTo.trim())
        if (validationError) {
            setError(validationError)
            return
        }
        setIsExporting(true)
        setError(null)
        try {
            const response = await apiFetch(exportUrl(selectedMonth?.value ?? '', year, numberFrom.trim(), numberTo.trim()))
            if (!response.ok) {
                const body = await response.json().catch(() => null) as { error?: string } | null
                throw new Error(body?.error ?? `Export failed (${response.status})`)
            }
            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = objectUrl
            link.download = downloadFilename(response, year, selectedMonth?.value ?? '')
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(objectUrl)
        } catch (exportError) {
            setError(exportError instanceof Error ? exportError.message : 'Export failed')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="p-4">
            {error && (
                <div className="mb-6 max-w-2xl">
                    <ErrorAlert
                        title="Export could not be completed"
                        description="Review the export settings and try again."
                        error={error}
                    />
                </div>
            )}
            <form className="max-w-2xl" onSubmit={exportData}>
                <Card>
                    <CardContent>
                        <FieldGroup>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="export-month">Month</FieldLabel>
                                    <Combobox
                                        items={months}
                                        value={month}
                                        onValueChange={setMonth}
                                        itemToStringLabel={(item) => item.label}
                                        itemToStringValue={(item) => item.value}
                                        isItemEqualToValue={(item, selected) =>
                                            item.value === selected.value
                                        }
                                    >
                                        <ComboboxInput id="export-month" />
                                        <ComboboxContent>
                                            <ComboboxList>
                                                {(item: (typeof months)[number]) => (
                                                    <ComboboxItem key={item.value} value={item}>
                                                        {item.label}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="export-year">Year</FieldLabel>
                                    <Input
                                        id="export-year"
                                        type="number"
                                        min="1"
                                        max="9999"
                                        required
                                        value={year}
                                        onChange={(event) => setYear(event.target.value)}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="export-number-from">Number from</FieldLabel>
                                    <Input id="export-number-from" type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="00001" value={numberFrom} onChange={(event) => setNumberFrom(event.target.value)} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="export-number-to">Number to</FieldLabel>
                                    <Input id="export-number-to" type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="99999" value={numberTo} onChange={(event) => setNumberTo(event.target.value)} />
                                </Field>
                            </div>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={isExporting}>
                            <Download />
                            {isExporting ? 'Exporting…' : 'Export'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                            const validationError = filterError(month, year, numberFrom.trim(), numberTo.trim())
                            if (validationError) { setError(validationError); return }
                            setError(null)
                            setEmailDialogOpen(true)
                        }}>
                            <Mail />
                            Send email
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            <EmailDocumentDialog
                open={emailDialogOpen}
                documentName="accounting export"
                generatedFileType="text file"
                customerId=""
                customerName=""
                businessYear={null}
                defaultRecipient="slavica.mijatovic@numeris.si"
                allowCustomerEmailSave={false}
                defaultSubject={`Drevi d.o.o. - Računovodski izvoz ${month?.label ?? ''} ${year}`}
                defaultMessage={`Pozdravljeni,\n\nv priponki vam pošiljamo računovodski izvoz za ${month?.label ?? ''} ${year}.\n\nLep pozdrav, Drevi d.o.o.`}
                onSend={async (fields) => {
                    const validationError = filterError(month, year, numberFrom.trim(), numberTo.trim())
                    if (validationError) throw new Error(validationError)
                    await sendAccountingExportEmail(month?.value ?? '', year, numberFrom.trim(), numberTo.trim(), fields)
                    toast.add({
                        title: 'Accounting export emailed',
                        description: `The accounting export was sent to ${fields.recipient}.`,
                        type: 'success',
                    })
                }}
                onOpenChange={setEmailDialogOpen}
            />
        </div>
    )
}

export default ExportDataPage
