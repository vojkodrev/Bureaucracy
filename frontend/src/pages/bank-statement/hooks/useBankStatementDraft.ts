import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { BankStatementEntry } from "@/lib/bank-statement-types";

export type BankStatementDraft = {
    statementNumber: string;
    statementDate?: Date;
    bankAccount: string;
    entries: BankStatementEntry[];
};

export const emptyBankStatementDraft = (): BankStatementDraft => ({
    statementNumber: "",
    statementDate: new Date(),
    bankAccount: "",
    entries: [],
});

export function serializeBankStatementDraft(draft: BankStatementDraft) {
    return JSON.stringify({
        ...draft,
        statementDate: draft.statementDate?.getTime() ?? null,
    });
}

export function useBankStatementDraft() {
    const [draft, setDraft] = useState<BankStatementDraft>(emptyBankStatementDraft);
    const [cleanDraft, setCleanDraft] = useState<string | null>(null);
    const serializedDraft = useMemo(() => serializeBankStatementDraft(draft), [draft]);

    const setField = <K extends keyof BankStatementDraft>(
        field: K,
        value: BankStatementDraft[K],
    ) => setDraft((current) => ({ ...current, [field]: value }));

    const setEntries: Dispatch<SetStateAction<BankStatementEntry[]>> = (value) => {
        setDraft((current) => ({
            ...current,
            entries: typeof value === "function" ? value(current.entries) : value,
        }));
    };
    const markClean = (value: BankStatementDraft = draft) =>
        setCleanDraft(serializeBankStatementDraft(value));
    const setCleanField = <K extends keyof BankStatementDraft>(
        field: K,
        value: BankStatementDraft[K],
    ) => {
        setDraft((current) => ({ ...current, [field]: value }));
        setCleanDraft((current) => {
            if (current === null) return null;
            const serializedValue = field === "statementDate"
                ? (value as Date | undefined)?.getTime() ?? null
                : value;
            return JSON.stringify({
                ...JSON.parse(current) as Record<string, unknown>,
                [field]: serializedValue,
            });
        });
    };

    return {
        draft,
        setDraft,
        setField,
        setEntries,
        setCleanField,
        markClean,
        clearCleanDraft: () => setCleanDraft(null),
        hasUnsavedChanges: cleanDraft !== null && cleanDraft !== serializedDraft,
    };
}
