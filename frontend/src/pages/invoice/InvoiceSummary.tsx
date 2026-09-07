import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'

type InvoiceSummaryProps = { total: number; paidAmount: string; onPaidAmountChange: (value: string) => void }

function InvoiceSummary({ total, paidAmount, onPaidAmountChange }: InvoiceSummaryProps) {
    const balanceDue = total - (Number(paidAmount) || 0)
    return (
        <Card className="ml-auto w-full max-w-sm">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow><TableCell>Total incl. VAT</TableCell><TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell></TableRow>
                        <TableRow><TableCell>Paid amount</TableCell><TableCell><Input aria-label="Paid amount" type="number" min="0" step="0.01" value={paidAmount} onChange={(event) => onPaidAmountChange(event.target.value)} className="ml-auto text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /></TableCell></TableRow>
                        <TableRow><TableCell>Balance due</TableCell><TableCell className="text-right font-medium">{formatCurrency(balanceDue)}</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default InvoiceSummary
