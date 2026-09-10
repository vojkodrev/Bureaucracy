import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import { format } from 'date-fns'

type InvoiceSummaryProps = {
    total: number
    paidAmount: string
    paymentDate?: Date
}

function InvoiceSummary({ total, paidAmount, paymentDate }: InvoiceSummaryProps) {
    const balanceDue = total - (Number(paidAmount) || 0)
    return (
        <Card className="ml-auto w-full max-w-2xl">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Total incl. VAT</TableCell><TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell></TableRow>
                        <TableRow>
                            <TableCell>{paymentDate ? `Payment on ${format(paymentDate, 'PPP')}` : 'Payment'}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(Number(paidAmount) || 0)}</TableCell>
                        </TableRow>
                        <TableRow><TableCell>Balance due</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceDue)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default InvoiceSummary
