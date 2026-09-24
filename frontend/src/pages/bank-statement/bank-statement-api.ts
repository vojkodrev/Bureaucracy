import { getSelectedBusinessYear } from "@/lib/business-year";
import type { BankStatement } from "@/lib/bank-statement-types";
import { postGraphql } from "@/lib/graphql";

const bankStatementQuery = `
    query BankStatement($businessYear: String!, $statementNumber: Int!) {
        bankStatement(businessYear: $businessYear, statementNumber: $statementNumber) {
            id statementNumber statementDate bankAccount
            entries {
                id statementId statementNumber paymentDate customerId customerName
                transactionType transactionTypeId outflow inflow documentNumber reference purpose
            }
        }
    }
`;

const latestBankStatementNumberQuery = `
    query LatestBankStatementNumber($businessYear: String!, $bankAccount: String) {
        latestBankStatementNumber(businessYear: $businessYear, bankAccount: $bankAccount)
    }
`;

const saveBankStatementMutation = `
    mutation SaveBankStatement($businessYear: String!, $statement: BankStatementInput!) {
        saveBankStatement(businessYear: $businessYear, statement: $statement) {
            id statementNumber statementDate bankAccount
            entries {
                id statementId statementNumber paymentDate customerId customerName
                transactionType transactionTypeId outflow inflow documentNumber reference purpose
            }
        }
    }
`;

export async function fetchBankStatement(
    statementNumber: number,
    signal?: AbortSignal,
): Promise<BankStatement> {
    const result = await postGraphql<{
        data?: { bankStatement: BankStatement | null };
        errors?: { message: string }[];
    }>(bankStatementQuery, {
        businessYear: getSelectedBusinessYear(),
        statementNumber,
    }, signal);
    if (!result.data?.bankStatement)
        throw new Error(`Bank statement ${statementNumber} was not found`);
    return result.data.bankStatement;
}

export async function fetchBankStatementExists(statementNumber: number): Promise<boolean> {
    const result = await postGraphql<{
        data?: { bankStatement: Pick<BankStatement, "id"> | null };
    }>(bankStatementQuery, {
        businessYear: getSelectedBusinessYear(), statementNumber,
    });
    return result.data?.bankStatement != null;
}

export async function fetchLatestBankStatementNumber(
    signal?: AbortSignal,
): Promise<number | null> {
    const result = await postGraphql<{
        data?: { latestBankStatementNumber: number | null };
        errors?: { message: string }[];
    }>(latestBankStatementNumberQuery, {
        businessYear: getSelectedBusinessYear(),
        bankAccount: null,
    }, signal);
    return result.data?.latestBankStatementNumber ?? null;
}

export async function postSaveBankStatement(statement: Record<string, unknown>) {
    const result = await postGraphql<{
        data?: { saveBankStatement: BankStatement };
        errors?: { message: string }[];
    }>(saveBankStatementMutation, {
        businessYear: getSelectedBusinessYear(),
        statement,
    });
    if (!result.data?.saveBankStatement)
        throw new Error("Saving bank statement returned no statement");
    return result.data.saveBankStatement;
}
