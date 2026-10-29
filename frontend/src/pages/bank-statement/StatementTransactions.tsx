import { useState } from "react";
import { ClipboardPaste, Copy, Pencil, Plus, Scissors, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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
import { toast } from "@/lib/toast";
import AddEditTransactionDialog from "./AddEditTransactionDialog";
import SplitInflowDialog from "./SplitInflowDialog";

const TRANSACTION_ROW_CLIPBOARD_TYPE = "bureaucracy/bank-statement-transaction-row";

type TransactionRowClipboardData = {
    type: typeof TRANSACTION_ROW_CLIPBOARD_TYPE;
    version: 1;
    entry: BankStatementEntry;
};

const isNullableNumber = (value: unknown): value is number | null =>
    value === null || (typeof value === "number" && Number.isFinite(value));
const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === "string";

function isTransactionRowClipboardData(
    value: unknown,
): value is TransactionRowClipboardData {
    if (typeof value !== "object" || value === null) return false;
    const payload = value as Record<string, unknown>;
    if (
        payload.type !== TRANSACTION_ROW_CLIPBOARD_TYPE ||
        payload.version !== 1 ||
        typeof payload.entry !== "object" ||
        payload.entry === null
    ) return false;

    const entry = payload.entry as Record<string, unknown>;
    return typeof entry.id === "number" &&
        typeof entry.statementId === "number" &&
        isNullableNumber(entry.statementNumber) &&
        isNullableString(entry.paymentDate) &&
        isNullableString(entry.customerId) &&
        isNullableString(entry.customerName) &&
        isNullableString(entry.transactionType) &&
        isNullableNumber(entry.transactionTypeId) &&
        isNullableNumber(entry.outflow) &&
        isNullableNumber(entry.inflow) &&
        isNullableString(entry.documentNumber) &&
        isNullableString(entry.reference) &&
        isNullableString(entry.endToEndId) &&
        isNullableString(entry.purpose);
}

type Props = {
    entries: BankStatementEntry[];
    statementDate?: Date;
    onChange: (entries: BankStatementEntry[]) => void;
};
function StatementTransactions({ entries, statementDate, onChange }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMounted, setDialogMounted] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [splittingIndex, setSplittingIndex] = useState<number | null>(null);
    const editing =
        editingIndex == null ? null : (entries[editingIndex] ?? null);
    const appendEntry = (entry: BankStatementEntry) => onChange([
        ...entries,
        {
            ...entry,
            id: Math.min(0, ...entries.map(({ id }) => id)) - 1,
            statementId: 0,
            statementNumber: null,
            paymentDate: statementDate?.toISOString() ?? null,
        },
    ]);
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
        setDialogMounted(false);
    };
    const splitInflow = (index: number, inflow: number) => {
        const entry = entries[index];
        if (entry?.inflow == null || inflow <= 0 || inflow >= entry.inflow) {
            return;
        }
        const duplicate: BankStatementEntry = {
            ...entry,
            id: Math.min(0, ...entries.map(({ id }) => id)) - 1,
            inflow,
            documentNumber: null,
        };
        const nextEntries = [...entries];
        nextEntries.splice(
            index,
            1,
            {
                ...entry,
                inflow: Math.round((entry.inflow - inflow) * 100) / 100,
            },
            duplicate,
        );
        onChange(nextEntries);
        setSplittingIndex(null);
    };
    const copyEntry = async (entry: BankStatementEntry) => {
        try {
            const payload: TransactionRowClipboardData = {
                type: TRANSACTION_ROW_CLIPBOARD_TYPE,
                version: 1,
                entry,
            };
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            toast.add({
                title: "Transaction row copied",
                description: "The bank statement transaction was copied as JSON.",
                type: "success",
            });
        } catch {
            toast.add({
                title: "Transaction row could not be copied",
                description: "Clipboard access was unavailable.",
                type: "error",
            });
        }
    };
    const pasteEntry = async () => {
        try {
            const payload: unknown = JSON.parse(await navigator.clipboard.readText());
            if (!isTransactionRowClipboardData(payload)) {
                throw new Error("Invalid transaction row clipboard data");
            }
            appendEntry(payload.entry);
            toast.add({
                title: "Transaction row pasted",
                description: "The copied transaction was added to the bank statement.",
                type: "success",
            });
        } catch {
            toast.add({
                title: "Transaction row could not be pasted",
                description: "Copy a transaction row from a bank statement and try again.",
                type: "error",
            });
        }
    };
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Transactions</CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            setEditingIndex(null);
                            setDialogMounted(true);
                            setDialogOpen(true);
                        }}
                    >
                        <Plus />
                        Add transaction
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { void pasteEntry(); }}
                    >
                        <ClipboardPaste />
                        Paste transaction
                    </Button>
                </div>
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
                                    {entry.documentNumber ? (
                                        <Button
                                            variant="link"
                                            render={
                                                <Link
                                                    to={`/invoice/${encodeURIComponent(entry.documentNumber)}`}
                                                />
                                            }
                                        >
                                            {entry.documentNumber}
                                        </Button>
                                    ) : (
                                        "—"
                                    )}
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
                                                setDialogMounted(true);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <Pencil />
                                        </Button>
                                        {(entry.inflow ?? 0) > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Split transaction inflow"
                                                title="Split transaction inflow"
                                                onClick={() =>
                                                    setSplittingIndex(index)
                                                }
                                            >
                                                <Scissors />
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label="Copy transaction"
                                            onClick={() => { void copyEntry(entry); }}
                                        >
                                            <Copy />
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
                {dialogMounted && (
                    <AddEditTransactionDialog
                        key={editingIndex ?? "new"}
                        entry={editing}
                        open={dialogOpen}
                        onCancel={() => {
                            setDialogOpen(false);
                            setDialogMounted(false);
                        }}
                        onOpenChange={setDialogOpen}
                        onSave={save}
                    />
                )}
                {splittingIndex !== null &&
                    entries[splittingIndex]?.inflow != null && (
                        <SplitInflowDialog
                            key={`${entries[splittingIndex].id}-${splittingIndex}`}
                            currentInflow={entries[splittingIndex].inflow}
                            open
                            onOpenChange={(open) => {
                                if (!open) setSplittingIndex(null);
                            }}
                            onSplit={(inflow) =>
                                splitInflow(splittingIndex, inflow)
                            }
                        />
                    )}
            </CardContent>
        </Card>
    );
}
export default StatementTransactions;
