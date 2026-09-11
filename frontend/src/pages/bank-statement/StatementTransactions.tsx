import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { BankStatementEntry } from "@/lib/bank-statement-types";
import AddEditTransactionDialog from "./AddEditTransactionDialog";

type Props = {
    entries: BankStatementEntry[];
    statementDate?: Date;
    onChange: (entries: BankStatementEntry[]) => void;
};
function StatementTransactions({ entries, statementDate, onChange }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const editing =
        editingIndex == null ? null : (entries[editingIndex] ?? null);
    const save = (entry: BankStatementEntry) => {
        const dated = {
            ...entry,
            paymentDate: statementDate?.toISOString() ?? null,
        };
        onChange(
            editingIndex == null
                ? [
                      ...entries,
                      {
                          ...dated,
                          id: Math.min(0, ...entries.map(({ id }) => id)) - 1,
                      },
                  ]
                : entries.map((current, index) =>
                      index === editingIndex
                          ? { ...dated, id: current.id }
                          : current,
                  ),
        );
        setDialogOpen(false);
    };
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Transactions</CardTitle>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        setEditingIndex(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus />
                    Add transaction
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Counterparty</TableHead>
                            <TableHead className="text-right">
                                Outflow
                            </TableHead>
                            <TableHead className="text-right">Inflow</TableHead>
                            <TableHead>Document number</TableHead>
                            <TableHead>Transaction type</TableHead>
                            <TableHead className="w-16">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No transactions.
                                </TableCell>
                            </TableRow>
                        )}
                        {entries.map((entry, index) => (
                            <TableRow key={`${entry.id}-${index}`}>
                                <TableCell>
                                    {formatDate(
                                        statementDate?.toISOString() ??
                                            entry.paymentDate,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {entry.customerName ?? "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {entry.outflow == null
                                        ? "—"
                                        : formatCurrency(entry.outflow)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {entry.inflow == null
                                        ? "—"
                                        : formatCurrency(entry.inflow)}
                                </TableCell>
                                <TableCell>
                                    {entry.documentNumber ?? "—"}
                                </TableCell>
                                <TableCell>
                                    {entry.transactionType ?? "—"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label="Edit transaction"
                                            onClick={() => {
                                                setEditingIndex(index);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <Pencil />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        aria-label="Delete transaction"
                                                    />
                                                }
                                            >
                                                <Trash2 />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete transaction?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This transaction will be
                                                        removed when the
                                                        statement is saved.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() =>
                                                            onChange(
                                                                entries.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {dialogOpen && (
                    <AddEditTransactionDialog
                        key={editingIndex ?? "new"}
                        entry={editing}
                        onOpenChange={setDialogOpen}
                        onSave={save}
                    />
                )}
            </CardContent>
        </Card>
    );
}
export default StatementTransactions;
