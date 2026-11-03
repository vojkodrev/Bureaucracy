import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'

type Props = {
    total: number
    withoutAmounts: boolean
}

export default function DeliveryNoteSummary(props: Props) {
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
                                {props.withoutAmounts
                                    ? 'Hidden on print'
                                    : formatCurrency(props.total)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
