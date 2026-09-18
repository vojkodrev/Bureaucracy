import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { BankStatementEntry } from "@/lib/bank-statement-types";
import { formatCurrency } from "@/lib/formatters";

type Props = {
    entries: BankStatementEntry[];
};

function BankStatementSummary({ entries }: Props) {
    const outflow = entries.reduce(
        (sum, entry) => sum + (entry.outflow ?? 0),
        0,
    );
    const inflow = entries.reduce(
        (sum, entry) => sum + (entry.inflow ?? 0),
        0,
    );

    return (
        <Card className="mt-6 ml-auto w-full max-w-md">
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total outflow</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(outflow)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Total inflow</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(inflow)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Net movement</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(inflow - outflow)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default BankStatementSummary;
