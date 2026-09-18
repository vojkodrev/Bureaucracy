import { useEffect, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { fetchLatestBankStatementNumber } from "../bank-statement-api";

export function useBankStatementNumberNavigation(
    routeStatementNumber: number | null,
    navigate: NavigateFunction,
) {
    const [result, setResult] = useState<{
        routeStatementNumber: number | null;
        value?: number | null;
        error?: string;
    }>({ routeStatementNumber: null });

    useEffect(() => {
        const controller = new AbortController();
        void fetchLatestBankStatementNumber(null, controller.signal)
            .then((value) => setResult({ routeStatementNumber, value }))
            .catch((error: unknown) => {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    setResult({
                        routeStatementNumber,
                        error: error instanceof Error
                            ? error.message
                            : "Loading latest bank statement failed",
                    });
                }
            });
        return () => controller.abort();
    }, [routeStatementNumber]);

    const latest = result.routeStatementNumber === routeStatementNumber
        ? result.value
        : undefined;
    const navigateTo = (value: number) => navigate(`/bank-statement/${value}`);

    return {
        canNavigatePrevious: routeStatementNumber !== null && routeStatementNumber > 1,
        canNavigateNext: routeStatementNumber !== null && latest != null && routeStatementNumber < latest,
        navigatePrevious: () => {
            if (routeStatementNumber !== null) navigateTo(routeStatementNumber - 1);
        },
        navigateNext: () => {
            if (routeStatementNumber !== null) navigateTo(routeStatementNumber + 1);
        },
        latestStatementNumberError: result.routeStatementNumber === routeStatementNumber
            ? result.error
            : undefined,
    };
}
