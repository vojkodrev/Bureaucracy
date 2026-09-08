import { useState } from 'react'
import type { FormEvent } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const months = monthNames.map((label, index) => ({
    label,
    value: String(index + 1),
}))

function exportUrl(month: string, year: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/exports/accounting'
    url.search = new URLSearchParams({ month, year }).toString()
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
    const [month, setMonth] = useState(months[today.getMonth()])
    const [year, setYear] = useState(String(today.getFullYear()))
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function exportData(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsExporting(true)
        setError(null)
        try {
            const response = await fetch(exportUrl(month.value, year))
            if (!response.ok) {
                const body = await response.json().catch(() => null) as { error?: string } | null
                throw new Error(body?.error ?? `Export failed (${response.status})`)
            }
            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = objectUrl
            link.download = downloadFilename(response, year, month.value)
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
                                        onValueChange={(selectedMonth) => {
                                            if (selectedMonth) setMonth(selectedMonth)
                                        }}
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
                            </div>
                            {error && <FieldError>{error}</FieldError>}
                        </FieldGroup>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isExporting}>
                            <Download />
                            {isExporting ? 'Exporting…' : 'Export'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}

export default ExportDataPage
