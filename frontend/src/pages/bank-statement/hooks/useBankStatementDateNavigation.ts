import { useEffect, useRef, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { fetchBankStatementNumberByDate } from "../bank-statement-api";

export function useBankStatementDateNavigation(
    statementDate: Date | undefined,
    routeStatementNumber: number | null,
    navigate: NavigateFunction,
) {
    const navigationKey = `${routeStatementNumber ?? ""}:${statementDate?.getTime() ?? ""}`;
    const [errorResult, setErrorResult] = useState<{
        navigationKey: string;
        error?: string;
    }>({ navigationKey });
    const [isLoading, setIsLoading] = useState(false);
    const requestRef = useRef<AbortController | null>(null);

    useEffect(() => () => requestRef.current?.abort(), [navigationKey]);

    const navigateByDate = (direction: "PREVIOUS" | "NEXT") => {
        if (!statementDate) return;

        setErrorResult({ navigationKey });
        setIsLoading(true);
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;

        void fetchBankStatementNumberByDate(statementDate, direction, controller.signal)
            .then((statementNumber) => {
                if (statementNumber === null) {
                    setErrorResult({
                        navigationKey,
                        error: `There is no ${direction.toLowerCase()} bank statement by date.`,
                    });
                    return;
                }
                navigate(`/bank-statement/${statementNumber}`);
            })
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === "AbortError")) {
                    setErrorResult({
                        navigationKey,
                        error: requestError instanceof Error
                            ? requestError.message
                            : "Finding bank statement by date failed",
                    });
                }
            })
            .finally(() => {
                if (requestRef.current === controller) setIsLoading(false);
            });
    };

    return {
        canNavigate: statementDate !== undefined && !isLoading,
        navigatePreviousDate: () => navigateByDate("PREVIOUS"),
        navigateNextDate: () => navigateByDate("NEXT"),
        error: errorResult.navigationKey === navigationKey
            ? errorResult.error
            : undefined,
    };
}
