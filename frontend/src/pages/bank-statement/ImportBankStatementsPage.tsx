import { useRef, useState } from 'react'
import { FileCode2, Trash2, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { toast } from '@/lib/toast'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const maximumFileSize = 5 * 1024 * 1024

type ImportResult = {
    fileName: string
    statementDate: string | null
    statementNumber: number | null
    bankAccount: string | null
    transactionCount: number | null
    outflow: number | null
    inflow: number | null
    status: 'Imported' | 'Failed'
    error?: string
}

function importUrl(): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/bank-statements/import'
    url.search = ''
    url.hash = ''
    return url.toString()
}

function ImportBankStatementsPage() {
    const pickerRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [results, setResults] = useState<ImportResult[]>([])
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const addFiles = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return
        const candidates = Array.from(selectedFiles)
        const invalid = candidates.find((file) =>
            !file.name.toLowerCase().endsWith('.xml') || file.size > maximumFileSize)
        if (invalid) {
            setError(!invalid.name.toLowerCase().endsWith('.xml')
                ? `${invalid.name} is not an XML file.`
                : `${invalid.name} is larger than 5 MiB.`)
            return
        }
        setFiles((current) => [...current, ...candidates])
        setResults([])
        setError(null)
        if (pickerRef.current) pickerRef.current.value = ''
    }

    const importStatements = async () => {
        if (importing || files.length === 0) return
        setImporting(true)
        setError(null)
        setResults([])
        try {
            const form = new FormData()
            form.set('businessYear', getSelectedBusinessYear())
            files.forEach((file) => form.append('files', file, file.name))
            const response = await fetch(importUrl(), { method: 'POST', body: form })
            const body = await response.json().catch(() => null) as {
                results?: ImportResult[]
                error?: string
            } | null
            if (!response.ok) {
                throw new Error(body?.error ?? `Bank statement import failed (${response.status})`)
            }
            const importedResults = body?.results ?? []
            setResults(importedResults)
            const successful = importedResults.filter(({ status }) => status === 'Imported').length
            if (successful > 0) {
                toast.add({
                    title: 'Bank statement import completed',
                    description: `${successful} bank statement${successful === 1 ? '' : 's'} imported.`,
                    type: 'success',
                })
            }
        } catch (importError) {
            setError(importError instanceof Error ? importError.message : 'Bank statement import failed')
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="p-4">
            {error && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Bank statements could not be imported"
                        description="Review the selected XML files and try again."
                        error={error}
                    />
                </div>
            )}
            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Import bank statements from XML</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                            className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                        >
                            <FileCode2 className="size-4" />
                            <span className="min-w-0 flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(0)} KiB
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                disabled={importing}
                                aria-label={`Remove ${file.name}`}
                                onClick={() => {
                                    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
                                    setResults([])
                                }}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    ))}
                    <Input
                        ref={pickerRef}
                        type="file"
                        multiple
                        accept=".xml,application/xml,text/xml"
                        disabled={importing}
                        onChange={(event) => addFiles(event.target.files)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Select up to 50 ISO 20022 XML files, up to 5 MiB each.
                        Statements are imported by date, oldest first.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button
                        type="button"
                        disabled={importing || files.length === 0}
                        onClick={() => void importStatements()}
                    >
                        <Upload />
                        {importing ? 'Importing…' : 'Import'}
                    </Button>
                </CardFooter>
            </Card>

            {results.length > 0 && (
                <Card className="mt-6 w-full">
                    <CardHeader><CardTitle>Import summary</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statement</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Transactions</TableHead>
                                    <TableHead className="text-right">Outflow</TableHead>
                                    <TableHead className="text-right">Inflow</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={`${result.fileName}-${result.statementNumber}-${index}`}>
                                        <TableCell className="max-w-64 truncate">{result.fileName}</TableCell>
                                        <TableCell>
                                            {result.statementDate
                                                ? formatDate(`${result.statementDate}T00:00:00Z`)
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {result.status === 'Imported' && result.statementNumber !== null ? (
                                                <Button
                                                    variant="link"
                                                    render={
                                                        <Link to={`/bank-statement/${result.statementNumber}`} />
                                                    }
                                                >
                                                    {result.statementNumber}
                                                </Button>
                                            ) : result.statementNumber ?? '—'}
                                        </TableCell>
                                        <TableCell>{result.bankAccount ?? '—'}</TableCell>
                                        <TableCell className="text-right">{result.transactionCount ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {result.outflow === null ? '—' : formatCurrency(result.outflow)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {result.inflow === null ? '—' : formatCurrency(result.inflow)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={result.status === 'Imported' ? 'text-green-700' : 'text-destructive'}>
                                                {result.status}
                                            </span>
                                            {result.error && (
                                                <p className="max-w-80 whitespace-normal text-xs text-muted-foreground">
                                                    {result.error}
                                                </p>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ImportBankStatementsPage
