import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'

export default function PriceQuoteSummary({ total }: { total: number }) {
    return (
        <Card className="ml-auto w-full lg:w-[calc(50%-0.75rem)]">
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total incl. VAT</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(total)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
