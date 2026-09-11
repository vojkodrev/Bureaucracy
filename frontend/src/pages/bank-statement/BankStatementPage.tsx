import { useCallback, useEffect, useRef, useState } from "react";
import { Save, Undo2 } from "lucide-react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import BankAccountComboboxField from "@/components/BankAccountComboboxField";
import DatePickerField from "@/components/DatePickerField";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { NumberInput } from "@/components/ui/number-input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getSelectedBusinessYear } from "@/lib/business-year";
import type {
    BankStatement,
    BankStatementEntry,
} from "@/lib/bank-statement-types";
import { dateForApi, dateFromSearchValue } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "@/lib/toast";
import UnsavedInvoiceAlert from "@/pages/invoice/UnsavedInvoiceAlert";
import StatementTransactions from "./StatementTransactions";

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
const statementQuery = `
    query BankStatement($businessYear: String!, $statementNumber: Int!) {
        bankStatement(businessYear: $businessYear, statementNumber: $statementNumber) {
            id
            statementNumber
            statementDate
            bankAccount
            entries {
                id
                statementId
                statementNumber
                paymentDate
                customerId
                customerName
                transactionType
                transactionTypeId
                outflow
                inflow
                documentNumber
            }
        }
    }
`;
const latestQuery = `
    query LatestBankStatementNumber(
        $businessYear: String!
        $bankAccount: String
    ) {
        latestBankStatementNumber(
            businessYear: $businessYear
            bankAccount: $bankAccount
        )
    }
`;
const saveMutation = `
    mutation SaveBankStatement(
        $businessYear: String!
        $statement: BankStatementInput!
    ) {
        saveBankStatement(
            businessYear: $businessYear
            statement: $statement
        ) {
            id
            statementNumber
            statementDate
            bankAccount
            entries {
                id
                statementId
                statementNumber
                paymentDate
                customerId
                customerName
                transactionType
                transactionTypeId
                outflow
                inflow
                documentNumber
            }
        }
    }
`;
type LoadResponse = {
    data?: { bankStatement: BankStatement | null };
    errors?: { message: string }[];
};
type LatestResponse = {
    data?: { latestBankStatementNumber: number | null };
    errors?: { message: string }[];
};
type SaveResponse = {
    data?: { saveBankStatement: BankStatement };
    errors?: { message: string }[];
};

async function fetchLatestStatementNumber(
    bankAccount: string | null,
    signal?: AbortSignal,
): Promise<number | null> {
    const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: latestQuery,
            variables: {
                businessYear: getSelectedBusinessYear(),
                bankAccount,
            },
        }),
        signal,
    });
    if (!response.ok)
        throw new Error(
            `Checking latest bank statement failed (${response.status})`,
        );
    const result = (await response.json()) as LatestResponse;
    if (result.errors?.length)
        throw new Error(result.errors.map(({ message }) => message).join(", "));
    return result.data?.latestBankStatementNumber ?? null;
}

const fromApiDate = (value?: string | null) =>
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined;
const serialize = (
    id: number | null,
    number: string,
    date: Date | undefined,
    account: string,
    entries: BankStatementEntry[],
) =>
    JSON.stringify({
        id,
        number,
        date: date?.getTime() ?? null,
        account,
        entries,
    });

function BankStatementPage() {
    const { statementNumber: routeStatementNumberParam } = useParams();
    const routeStatementNumber = routeStatementNumberParam
        ? Number(routeStatementNumberParam)
        : null;
    const navigate = useNavigate();
    const allowNavigation = useRef(false);
    const [id, setID] = useState<number | null>(null);
    const [number, setNumber] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [account, setAccount] = useState("");
    const [entries, setEntries] = useState<BankStatementEntry[]>([]);
    const [cleanDraft, setCleanDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(Boolean(routeStatementNumber));
    const [saving, setSaving] = useState(false);
    const [confirmRevert, setConfirmRevert] = useState(false);
    const [numberWarning, setNumberWarning] = useState<
        "historical" | "skipped" | null
    >(null);
    const draft = serialize(id, number, date, account, entries);
    const dirty = cleanDraft !== null && cleanDraft !== draft;
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !allowNavigation.current &&
            dirty &&
            currentLocation.pathname !== nextLocation.pathname,
    );

    const loadStatement = useCallback(async () => {
        if (!routeStatementNumber) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(graphqlUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: statementQuery,
                    variables: {
                        businessYear: getSelectedBusinessYear(),
                        statementNumber: routeStatementNumber,
                    },
                }),
            });
            if (!response.ok)
                throw new Error(
                    `Loading bank statement failed (${response.status})`,
                );
            const result = (await response.json()) as LoadResponse;
            if (result.errors?.length)
                throw new Error(
                    result.errors.map(({ message }) => message).join(", "),
                );
            const statement = result.data?.bankStatement;
            if (!statement)
                throw new Error(`Bank statement ${routeStatementNumber} was not found`);
            setID(statement.id);
            setNumber(String(statement.statementNumber ?? ""));
            setDate(fromApiDate(statement.statementDate));
            setAccount(statement.bankAccount ?? "");
            setEntries(statement.entries);
            setCleanDraft(
                serialize(
                    statement.id,
                    String(statement.statementNumber ?? ""),
                    fromApiDate(statement.statementDate),
                    statement.bankAccount ?? "",
                    statement.entries,
                ),
            );
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Loading bank statement failed",
            );
        } finally {
            setLoading(false);
        }
    }, [routeStatementNumber]);
    useEffect(() => {
        if (routeStatementNumber) {
            void loadStatement();
            return;
        }

        allowNavigation.current = false;
        const today = new Date();
        setID(null);
        setNumber("");
        setDate(today);
        setAccount("");
        setEntries([]);
        setCleanDraft(serialize(null, "", today, "", []));
        setError(null);
        setLoading(false);
        setConfirmRevert(false);
        setNumberWarning(null);

        const abortController = new AbortController();
        void fetchLatestStatementNumber(null, abortController.signal)
            .then((latest) => {
                const nextNumber = String((latest ?? 0) + 1);
                setNumber(nextNumber);
                setCleanDraft(serialize(null, nextNumber, today, "", []));
            })
            .catch((requestError: unknown) => {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === "AbortError"
                )
                    return;
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Loading next bank statement number failed",
                );
            });
        return () => abortController.abort();
    }, [loadStatement, routeStatementNumber]);
    useEffect(() => {
        if (!dirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) =>
            event.preventDefault();
        window.addEventListener("beforeunload", beforeUnload);
        return () => window.removeEventListener("beforeunload", beforeUnload);
    }, [dirty]);

    const performSave = async () => {
        setNumberWarning(null);
        setSaving(true);
        setError(null);
        try {
            const response = await fetch(graphqlUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: saveMutation,
                    variables: {
                        businessYear: getSelectedBusinessYear(),
                        statement: {
                            id,
                            statementNumber: Number(number),
                            statementDate: dateForApi(date),
                            bankAccount: account,
                            entries: entries.map((entry) => ({
                                id: entry.id > 0 ? entry.id : null,
                                customerId: entry.customerId,
                                customerName: entry.customerName,
                                transactionTypeId: entry.transactionTypeId,
                                outflow: entry.outflow,
                                inflow: entry.inflow,
                                documentNumber: entry.documentNumber,
                            })),
                        },
                    },
                }),
            });
            if (!response.ok)
                throw new Error(
                    `Saving bank statement failed (${response.status})`,
                );
            const result = (await response.json()) as SaveResponse;
            if (result.errors?.length)
                throw new Error(
                    result.errors.map(({ message }) => message).join(", "),
                );
            const saved = result.data?.saveBankStatement;
            if (!saved)
                throw new Error("Saving bank statement returned no statement");
            toast.add({
                title: "Bank statement saved",
                description: `Statement ${saved.statementNumber} was saved successfully.`,
                type: "success",
            });
            const savedDate = fromApiDate(saved.statementDate);
            setID(saved.id);
            setNumber(String(saved.statementNumber ?? ""));
            setDate(savedDate);
            setAccount(saved.bankAccount ?? "");
            setEntries(saved.entries);
            setCleanDraft(
                serialize(
                    saved.id,
                    String(saved.statementNumber ?? ""),
                    savedDate,
                    saved.bankAccount ?? "",
                    saved.entries,
                ),
            );
            if (routeStatementNumber !== saved.statementNumber) {
                allowNavigation.current = true;
                navigate(`/bank-statement/${saved.statementNumber}`);
            }
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Saving bank statement failed",
            );
        } finally {
            setSaving(false);
        }
    };
    const requestSave = async () => {
        if (!date || !account || number === "" || saving) return;
        try {
            const latest = await fetchLatestStatementNumber(account || null);
            const value = Number(number);
            if (latest != null && value !== latest && value !== latest + 1) {
                setNumberWarning(value > latest + 1 ? "skipped" : "historical");
                return;
            }
            await performSave();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Checking latest bank statement failed",
            );
        }
    };
    useEffect(() => {
        const keydown = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                void requestSave();
            }
        };
        window.addEventListener("keydown", keydown);
        return () => window.removeEventListener("keydown", keydown);
    });
    const outflow = entries.reduce(
        (sum, entry) => sum + (entry.outflow ?? 0),
        0,
    );
    const inflow = entries.reduce((sum, entry) => sum + (entry.inflow ?? 0), 0);
    return (
        <div className="max-w-5xl p-4">
            <Menubar className="mb-6 w-fit">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={
                                !date ||
                                !account ||
                                number === "" ||
                                loading ||
                                saving
                            }
                            onClick={() => void requestSave()}
                        >
                            <Save />
                            {saving ? "Saving…" : "Save"}
                            <MenubarShortcut>Ctrl+S</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={!id || loading || !dirty}
                            onClick={() => setConfirmRevert(true)}
                        >
                            <Undo2 />
                            Revert
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            {error && (
                <p className="mb-6 text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>General information</CardTitle>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <Field>
                                <FieldLabel htmlFor="statement-number">
                                    Statement number
                                </FieldLabel>
                                <NumberInput
                                    id="statement-number"
                                    min="0"
                                    step="1"
                                    value={number}
                                    onChange={(event) =>
                                        setNumber(event.target.value)
                                    }
                                />
                            </Field>
                            <DatePickerField
                                id="statement-date"
                                label="Statement date"
                                name="statementDate"
                                date={date}
                                onSelect={setDate}
                            />
                            <BankAccountComboboxField
                                id="statement-account"
                                label="Bank account"
                                value={account}
                                onChange={setAccount}
                            />
                        </div>
                    </FieldGroup>
                </CardContent>
            </Card>
            <StatementTransactions
                entries={entries}
                statementDate={date}
                onChange={setEntries}
            />
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
            <UnsavedInvoiceAlert
                open={blocker.state === "blocked"}
                onOpenChange={(open) => {
                    if (!open && blocker.state === "blocked") blocker.reset();
                }}
                onDiscard={() => {
                    if (blocker.state === "blocked") {
                        allowNavigation.current = true;
                        setCleanDraft(draft);
                        blocker.proceed();
                    }
                }}
                title="Discard bank statement changes?"
                description="You have unsaved changes to this bank statement."
            />
            <UnsavedInvoiceAlert
                open={confirmRevert}
                onOpenChange={setConfirmRevert}
                onDiscard={() => {
                    setConfirmRevert(false);
                    void loadStatement();
                }}
                title="Revert bank statement changes?"
                description="Your unsaved changes will be discarded."
                actionLabel="Discard and revert"
            />
            <AlertDialog
                open={numberWarning !== null}
                onOpenChange={(open) => {
                    if (!open) setNumberWarning(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {numberWarning === "skipped"
                                ? "Skip statement numbers?"
                                : "Save an earlier bank statement?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {numberWarning === "skipped"
                                ? "This statement number leaves a gap in the " +
                                  "sequence for the selected bank account."
                                : "This is not the latest statement for the " +
                                  "selected bank account. Saving it will update " +
                                  "a historical accounting record."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep editing</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void performSave()}>
                            {numberWarning === "skipped"
                                ? "Save and skip numbers"
                                : "Save historical statement"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
export default BankStatementPage;
