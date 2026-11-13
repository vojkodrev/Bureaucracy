import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import { TriangleAlertIcon } from 'lucide-react'

type Props = {
    total: number
    storedTotal?: number | null
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
                            <TableCell>
                                {props.storedTotal == null
                                    ? 'Total incl. VAT'
                                    : 'Calculated total incl. VAT'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {props.withoutAmounts
                                    ? 'Hidden on print'
                                    : formatCurrency(props.total)}
                            </TableCell>
                        </TableRow>
                        {props.storedTotal != null && (
                            <TableRow>
                                <TableCell>
                                    <span className="inline-flex items-center gap-2">
                                        Stored total incl. VAT
                                        <TriangleAlertIcon className="size-4 text-amber-600" aria-label="Inconsistent total" />
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(props.storedTotal)}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
