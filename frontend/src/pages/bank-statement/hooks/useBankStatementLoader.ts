import { useEffect, useEffectEvent, useRef, useState } from "react";
import { dateFromSearchValue } from "@/lib/dates";
import { toast } from "@/lib/toast";
import { fetchBankStatement, fetchLatestBankStatementNumber } from "../bank-statement-api";
import type { BankStatementDraft } from "./useBankStatementDraft";

export type BankStatementRequestErrors = Partial<Record<"nextStatementNumber", string>>;

const wasAborted = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";
const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;
const fromApiDate = (value?: string | null) =>
    value ? dateFromSearchValue(value.slice(0, 10)) : undefined;

type Options = {
    routeStatementNumber: number | null;
    replaceDraft: (draft: BankStatementDraft) => void;
    markClean: (draft: BankStatementDraft) => void;
    setCleanField: <K extends keyof BankStatementDraft>(
        field: K,
        value: BankStatementDraft[K],
    ) => void;
    disallowNavigation: () => void;
};

export function useBankStatementLoader({
    routeStatementNumber,
    replaceDraft,
    markClean,
    setCleanField,
    disallowNavigation,
}: Options) {
    const pendingRevertRef = useRef(false);
    const [statementId, setStatementId] = useState<number | null>(null);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [requestErrors, setRequestErrors] = useState<BankStatementRequestErrors>({});
    const replaceLoadedDraft = useEffectEvent(replaceDraft);
    const markLoadedDraftClean = useEffectEvent(markClean);
    const setLoadedCleanField = useEffectEvent(setCleanField);
    const finishNavigation = useEffectEvent(disallowNavigation);
    const requestKey = `${routeStatementNumber ?? ""}:${reloadVersion}`;
    const [loadResult, setLoadResult] = useState({
        requestKey: "__initial__",
        error: null as string | null,
    });
    const isLoading = routeStatementNumber !== null && loadResult.requestKey !== requestKey;
    const error = loadResult.requestKey === requestKey ? loadResult.error : null;

    useEffect(() => {
        if (routeStatementNumber === null) return;
        const controller = new AbortController();
        void fetchBankStatement(routeStatementNumber, controller.signal)
            .then((statement) => {
                const draft: BankStatementDraft = {
                    statementNumber: String(statement.statementNumber ?? ""),
                    statementDate: fromApiDate(statement.statementDate),
                    bankAccount: statement.bankAccount ?? "",
                    entries: statement.entries,
                };
                setStatementId(statement.id);
                replaceLoadedDraft(draft);
                markLoadedDraftClean(draft);
                finishNavigation();
                setLoadResult({ requestKey, error: null });
                if (pendingRevertRef.current) {
                    pendingRevertRef.current = false;
                    toast.add({
                        title: "Bank statement reverted",
                        description: `Statement ${statement.statementNumber} was restored to its last saved version.`,
                        type: "success",
                    });
                }
            })
            .catch((requestError: unknown) => {
                if (wasAborted(requestError)) return;
                pendingRevertRef.current = false;
                setLoadResult({
                    requestKey,
                    error: errorMessage(requestError, "Loading bank statement failed"),
                });
            });
        return () => controller.abort();
    }, [requestKey, routeStatementNumber]);

    useEffect(() => {
        if (routeStatementNumber !== null) return;
        finishNavigation();
        const initialDraft: BankStatementDraft = {
            statementNumber: "",
            statementDate: new Date(),
            bankAccount: "",
            entries: [],
        };
        setStatementId(null);
        replaceLoadedDraft(initialDraft);
        markLoadedDraftClean(initialDraft);
        setRequestErrors({});
        const controller = new AbortController();
        void fetchLatestBankStatementNumber(controller.signal)
            .then((latest) => {
                setLoadedCleanField("statementNumber", String((latest ?? 0) + 1));
            })
            .catch((requestError: unknown) => {
                if (!wasAborted(requestError)) {
                    setRequestErrors({
                        nextStatementNumber: errorMessage(
                            requestError,
                            "Loading next bank statement number failed",
                        ),
                    });
                }
            });
        return () => controller.abort();
    }, [routeStatementNumber]);

    const reload = () => {
        pendingRevertRef.current = true;
        setReloadVersion((version) => version + 1);
    };

    return {
        statementId,
        isLoading,
        error,
        requestErrors,
        reload,
        reloadAfterSave: () => setReloadVersion((version) => version + 1),
    };
}
