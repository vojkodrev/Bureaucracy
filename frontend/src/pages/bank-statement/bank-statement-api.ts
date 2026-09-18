import { getSelectedBusinessYear } from "@/lib/business-year";
import type { BankStatement } from "@/lib/bank-statement-types";

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;

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

type GraphqlResponse = { errors?: { message: string }[] };

async function postGraphql<T extends GraphqlResponse>(
    query: string,
    variables: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const result = (await response.json()) as T;
    if (result.errors?.length)
        throw new Error(result.errors.map(({ message }) => message).join(", "));
    return result;
}

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

export async function fetchLatestBankStatementNumber(
    bankAccount: string | null,
    signal?: AbortSignal,
): Promise<number | null> {
    const result = await postGraphql<{
        data?: { latestBankStatementNumber: number | null };
        errors?: { message: string }[];
    }>(latestBankStatementNumberQuery, {
        businessYear: getSelectedBusinessYear(),
        bankAccount,
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
