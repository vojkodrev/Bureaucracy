import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import { roundCurrency } from '@/lib/numbers'
import { format } from 'date-fns'
import { TriangleAlertIcon } from 'lucide-react'

type InvoiceSummaryProps = {
    total: number
    storedTotal?: number | null
    creditedAmount: number
    paidAmount: string
    paymentDate?: Date
    zoi?: string
    eor?: string
}

function InvoiceSummary({ total, storedTotal, creditedAmount, paidAmount, paymentDate, zoi, eor }: InvoiceSummaryProps) {
    const credits = roundCurrency(creditedAmount)
    const balanceDue = Math.max(0, roundCurrency(total + credits - (Number(paidAmount) || 0)))
    return (
        <Card className="ml-auto w-full lg:w-[55%]">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{storedTotal == null ? 'Total incl. VAT' : 'Calculated total incl. VAT'}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
                        </TableRow>
                        {storedTotal != null && (
                            <TableRow>
                                <TableCell>
                                    <span className="inline-flex items-center gap-2">
                                        Stored total incl. VAT
                                        <TriangleAlertIcon className="size-4 text-amber-600" aria-label="Inconsistent total" />
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(storedTotal)}</TableCell>
                            </TableRow>
                        )}
                        {credits !== 0 && (
                            <TableRow>
                                <TableCell>Credit notes</TableCell>
                                <TableCell className="text-right font-medium text-foreground">
                                    {formatCurrency(credits)}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell>{paymentDate ? `Payment on ${format(paymentDate, 'PPP')}` : 'Payment'}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(Number(paidAmount) || 0)}</TableCell>
                        </TableRow>
                        <TableRow><TableCell>Balance due</TableCell><TableCell className="text-right font-semibold">{formatCurrency(balanceDue)}</TableCell></TableRow>
                        {zoi && <TableRow><TableCell>ZOI</TableCell><TableCell className="break-all text-right font-medium">{zoi}</TableCell></TableRow>}
                        {eor && <TableRow><TableCell>EOR</TableCell><TableCell className="break-all text-right font-medium">{eor}</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default InvoiceSummary
