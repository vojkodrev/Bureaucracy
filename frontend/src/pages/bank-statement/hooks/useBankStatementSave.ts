import { useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { dateForApi } from "@/lib/dates";
import { toast } from "@/lib/toast";
import type { BankStatementNumberWarning } from "../BankStatementNumberAlert";
import { fetchLatestBankStatementNumber, postSaveBankStatement } from "../bank-statement-api";
import type { BankStatementDraft } from "./useBankStatementDraft";

type Options = {
    statementId: number | null;
    draft: BankStatementDraft;
    routeStatementNumber: number | null;
    isLoading: boolean;
    loadError: string | null;
    navigate: NavigateFunction;
    markClean: (draft: BankStatementDraft) => void;
    allowNavigation: () => void;
    reloadAfterSave: () => void;
};

export function useBankStatementSave({
    statementId,
    draft,
    routeStatementNumber,
    isLoading,
    loadError,
    navigate,
    markClean,
    allowNavigation,
    reloadAfterSave,
}: Options) {
    const saveInProgress = useRef(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [latestNumberError, setLatestNumberError] = useState<string | null>(null);
    const [numberWarning, setNumberWarning] = useState<BankStatementNumberWarning | null>(null);
    const canSave = Boolean(draft.statementDate) && Boolean(draft.bankAccount) &&
        draft.statementNumber !== "" && !isLoading && !loadError;

    const performSave = async () => {
        setNumberWarning(null);
        setSaveError(null);
        try {
            const saved = await postSaveBankStatement({
                id: statementId,
                statementNumber: Number(draft.statementNumber),
                statementDate: dateForApi(draft.statementDate),
                bankAccount: draft.bankAccount,
                entries: draft.entries.map((entry) => ({
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
            });
            toast.add({
                title: "Bank statement saved",
                description: `Statement ${saved.statementNumber} was saved successfully.`,
                type: "success",
            });
            markClean(draft);
            if (routeStatementNumber === saved.statementNumber) reloadAfterSave();
            else {
                allowNavigation();
                navigate(`/bank-statement/${saved.statementNumber}`);
            }
            return true;
        } catch (error: unknown) {
            setSaveError(error instanceof Error ? error.message : "Saving bank statement failed");
            return false;
        }
    };

    const requestSave = async () => {
        if (!canSave || saveInProgress.current) return false;
        saveInProgress.current = true;
        setIsSaving(true);
        setLatestNumberError(null);
        try {
            const latest = await fetchLatestBankStatementNumber(draft.bankAccount || null);
            const value = Number(draft.statementNumber);
            if (latest != null && value !== latest && value !== latest + 1) {
                setNumberWarning(value > latest + 1 ? "skipped" : "historical");
                return false;
            }
            return await performSave();
        } catch (error: unknown) {
            setLatestNumberError(
                error instanceof Error ? error.message : "Checking latest bank statement failed",
            );
            return false;
        } finally {
            saveInProgress.current = false;
            setIsSaving(false);
        }
    };

    const confirmSave = async () => {
        if (!canSave || saveInProgress.current) return false;
        saveInProgress.current = true;
        setIsSaving(true);
        try { return await performSave(); }
        finally {
            saveInProgress.current = false;
            setIsSaving(false);
        }
    };

    return {
        canSave,
        isSaving,
        saveError,
        setSaveError,
        latestNumberError,
        numberWarning,
        setNumberWarning,
        requestSave,
        confirmSave,
    };
}
