import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { getSelectedBusinessYear } from "@/lib/business-year";
import type {
    BankStatement,
    BankStatementEntry,
} from "@/lib/bank-statement-types";
import { dateForApi, dateFromSearchValue } from "@/lib/dates";
import { toast } from "@/lib/toast";
import BankStatementErrors from "./BankStatementErrors";
import BankStatementGeneralInformation from "./BankStatementGeneralInformation";
import BankStatementMenu from "./BankStatementMenu";
import BankStatementNumberAlert, {
    type BankStatementNumberWarning,
} from "./BankStatementNumberAlert";
import BankStatementSummary from "./BankStatementSummary";
import StatementTransactions from "./StatementTransactions";
import UnsavedBankStatementAlerts from "./UnsavedBankStatementAlerts";

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
                reference
                purpose
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
                reference
                purpose
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
const updateCleanDraft = (
    draft: string | null,
    changes: Partial<{ number: string; account: string }>,
) => (draft ? JSON.stringify({ ...JSON.parse(draft), ...changes }) : draft);

function BankStatementPage() {
    const { statementNumber: routeStatementNumberParam } = useParams();
    const routeStatementNumber = routeStatementNumberParam
        ? Number(routeStatementNumberParam)
        : null;
    const navigate = useNavigate();
    const allowNavigation = useRef(false);
    const saveInProgress = useRef(false);
    const [id, setID] = useState<number | null>(null);
    const [number, setNumber] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [account, setAccount] = useState("");
    const [entries, setEntries] = useState<BankStatementEntry[]>([]);
    const [cleanDraft, setCleanDraft] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [nextNumberError, setNextNumberError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [latestNumberError, setLatestNumberError] = useState<string | null>(
        null,
    );
    const [navigationResult, setNavigationResult] = useState<{
        routeStatementNumber: number | null;
        value?: number | null;
        error?: string;
    }>({ routeStatementNumber: null });
    const [loading, setLoading] = useState(Boolean(routeStatementNumber));
    const [reloadVersion, setReloadVersion] = useState(0);
    const [saving, setSaving] = useState(false);
    const [confirmRevert, setConfirmRevert] = useState(false);
    const [numberWarning, setNumberWarning] =
        useState<BankStatementNumberWarning | null>(null);
    const draft = serialize(id, number, date, account, entries);
    const dirty = cleanDraft !== null && cleanDraft !== draft;
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !allowNavigation.current &&
            dirty &&
            (currentLocation.pathname !== nextLocation.pathname ||
                currentLocation.search !== nextLocation.search ||
                currentLocation.hash !== nextLocation.hash),
    );

    useEffect(() => {
        const abortController = new AbortController();
        void fetchLatestStatementNumber(null, abortController.signal)
            .then((value) => {
                setNavigationResult({ routeStatementNumber, value });
            })
            .catch((navigationError: unknown) => {
                if (
                    navigationError instanceof DOMException &&
                    navigationError.name === "AbortError"
                )
                    return;
                setNavigationResult({
                    routeStatementNumber,
                    error:
                        navigationError instanceof Error
                            ? navigationError.message
                            : "Loading latest bank statement failed",
                });
            });
        return () => abortController.abort();
    }, [routeStatementNumber]);

    const latestStatementNumber =
        navigationResult.routeStatementNumber === routeStatementNumber
            ? navigationResult.value
            : undefined;
    const canNavigatePrevious =
        routeStatementNumber !== null && routeStatementNumber > 1;
    const canNavigateNext =
        routeStatementNumber !== null &&
        latestStatementNumber != null &&
        routeStatementNumber < latestStatementNumber;
    const navigateToStatement = (statementNumber: number) => {
        navigate(`/bank-statement/${statementNumber}`);
    };

    useEffect(() => {
        if (!routeStatementNumber) return;
        const abortController = new AbortController();
        setLoading(true);
        setLoadError(null);
        void fetch(graphqlUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: statementQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    statementNumber: routeStatementNumber,
                },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
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
                    throw new Error(
                        `Bank statement ${routeStatementNumber} was not found`,
                    );
                const statementDate = fromApiDate(statement.statementDate);
                setID(statement.id);
                setNumber(String(statement.statementNumber ?? ""));
                setDate(statementDate);
                setAccount(statement.bankAccount ?? "");
                setEntries(statement.entries);
                setCleanDraft(
                    serialize(
                        statement.id,
                        String(statement.statementNumber ?? ""),
                        statementDate,
                        statement.bankAccount ?? "",
                        statement.entries,
                    ),
                );
                setLoading(false);
            })
            .catch((loadError: unknown) => {
                if (
                    loadError instanceof DOMException &&
                    loadError.name === "AbortError"
                )
                    return;
                setLoadError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Loading bank statement failed",
                );
                setLoading(false);
            });
        return () => abortController.abort();
    }, [reloadVersion, routeStatementNumber]);

    useEffect(() => {
        if (routeStatementNumber) return;

        allowNavigation.current = false;
        const today = new Date();
        setID(null);
        setNumber("");
        setDate(today);
        setAccount("");
        setEntries([]);
        setCleanDraft(serialize(null, "", today, "", []));
        setLoadError(null);
        setNextNumberError(null);
        setLoading(false);
        setConfirmRevert(false);
        setNumberWarning(null);

        const abortController = new AbortController();
        void fetchLatestStatementNumber(null, abortController.signal)
            .then((latest) => {
                const nextNumber = String((latest ?? 0) + 1);
                setNumber(nextNumber);
                setCleanDraft((draft) =>
                    updateCleanDraft(draft, { number: nextNumber }),
                );
            })
            .catch((requestError: unknown) => {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === "AbortError"
                )
                    return;
                setNextNumberError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Loading next bank statement number failed",
                );
            });
        return () => abortController.abort();
    }, [routeStatementNumber]);
    useEffect(() => {
        if (!dirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) =>
            event.preventDefault();
        window.addEventListener("beforeunload", beforeUnload);
        return () => window.removeEventListener("beforeunload", beforeUnload);
    }, [dirty]);

    const performSave = async () => {
        setNumberWarning(null);
        setSaveError(null);
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
                                reference: entry.reference,
                                purpose: entry.purpose,
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
            setSaveError(
                saveError instanceof Error
                    ? saveError.message
                    : "Saving bank statement failed",
            );
        }
    };
    const requestSave = async () => {
        if (!date || !account || number === "" || saveInProgress.current)
            return;
        saveInProgress.current = true;
        setSaving(true);
        setLatestNumberError(null);
        try {
            const latest = await fetchLatestStatementNumber(account || null);
            const value = Number(number);
            if (latest != null && value !== latest && value !== latest + 1) {
                setNumberWarning(value > latest + 1 ? "skipped" : "historical");
                return;
            }
            await performSave();
        } catch (requestError) {
            setLatestNumberError(
                requestError instanceof Error
                    ? requestError.message
                    : "Checking latest bank statement failed",
            );
        } finally {
            saveInProgress.current = false;
            setSaving(false);
        }
    };
    const confirmSave = async () => {
        if (!date || !account || number === "" || saveInProgress.current)
            return;
        saveInProgress.current = true;
        setSaving(true);
        try {
            await performSave();
        } finally {
            saveInProgress.current = false;
            setSaving(false);
        }
    };
    const onSaveShortcut = useEffectEvent(() => {
        void requestSave();
    });
    useEffect(() => {
        const keydown = (event: KeyboardEvent) => {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "s"
            ) {
                event.preventDefault();
                onSaveShortcut();
            }
        };
        window.addEventListener("keydown", keydown);
        return () => window.removeEventListener("keydown", keydown);
    }, []);
    const setDefaultAccount = (code: string) => {
        setAccount(code);
        setCleanDraft((draft) => updateCleanDraft(draft, { account: code }));
    };
    return (
        <div className="max-w-5xl p-4">
            <BankStatementErrors
                loadError={loadError}
                navigationError={
                    navigationResult.routeStatementNumber ===
                    routeStatementNumber
                        ? navigationResult.error
                        : undefined
                }
                nextNumberError={nextNumberError}
                latestNumberError={latestNumberError}
                saveError={saveError}
            />
            <BankStatementMenu
                canSave={
                    Boolean(date) &&
                    Boolean(account) &&
                    number !== "" &&
                    !loading &&
                    !saving
                }
                canRevert={Boolean(id) && !loading && dirty}
                canNavigatePrevious={canNavigatePrevious}
                canNavigateNext={canNavigateNext}
                isSaving={saving}
                onSave={() => void requestSave()}
                onRevert={() => setConfirmRevert(true)}
                onNavigatePrevious={() => {
                    if (routeStatementNumber !== null)
                        navigateToStatement(routeStatementNumber - 1);
                }}
                onNavigateNext={() => {
                    if (routeStatementNumber !== null)
                        navigateToStatement(routeStatementNumber + 1);
                }}
            />
            <BankStatementGeneralInformation
                statementNumber={number}
                statementDate={date}
                bankAccount={account}
                selectDefaultAccount={!routeStatementNumber}
                onStatementNumberChange={setNumber}
                onStatementDateChange={setDate}
                onBankAccountChange={setAccount}
                onDefaultBankAccountChange={setDefaultAccount}
            />
            <StatementTransactions
                entries={entries}
                statementDate={date}
                onChange={setEntries}
            />
            <BankStatementSummary entries={entries} />
            <UnsavedBankStatementAlerts
                isNavigationBlocked={blocker.state === "blocked"}
                isConfirmingRevert={confirmRevert}
                onCancelNavigation={() => {
                    if (blocker.state === "blocked") blocker.reset();
                }}
                onDiscardAndNavigate={() => {
                    if (blocker.state === "blocked") {
                        allowNavigation.current = true;
                        setCleanDraft(draft);
                        blocker.proceed();
                    }
                }}
                onConfirmingRevertChange={setConfirmRevert}
                onDiscardAndRevert={() => {
                    setConfirmRevert(false);
                    setReloadVersion((version) => version + 1);
                }}
            />
            <BankStatementNumberAlert
                warning={numberWarning}
                onOpenChange={(open) => {
                    if (!open) setNumberWarning(null);
                }}
                onConfirm={() => void confirmSave()}
            />
        </div>
    );
}
export default BankStatementPage;
