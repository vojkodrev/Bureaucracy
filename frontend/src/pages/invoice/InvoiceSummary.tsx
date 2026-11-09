import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import { roundCurrency } from '@/lib/numbers'
import { format } from 'date-fns'

type InvoiceSummaryProps = {
    total: number
    creditedAmount: number
    paidAmount: string
    paymentDate?: Date
}

function InvoiceSummary({ total, creditedAmount, paidAmount, paymentDate }: InvoiceSummaryProps) {
    const credits = roundCurrency(creditedAmount)
    const balanceDue = Math.max(0, roundCurrency(total + credits - (Number(paidAmount) || 0)))
    return (
        <Card className="ml-auto w-full lg:w-[calc(50%-0.75rem)]">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Total incl. VAT</TableCell><TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell></TableRow>
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
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default InvoiceSummary
