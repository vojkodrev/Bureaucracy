import ErrorAlert from "@/components/ErrorAlert";

type Props = {
    loadError: string | null;
    navigationError?: string;
    nextNumberError: string | null;
    latestNumberError: string | null;
    saveError: string | null;
};

function BankStatementErrors({
    loadError,
    navigationError,
    nextNumberError,
    latestNumberError,
    saveError,
}: Props) {
    const errors = [
        [
            "load",
            "Bank statement could not be loaded",
            "The bank statement data could not be retrieved.",
            loadError,
        ],
        [
            "navigation",
            "Latest statement number could not be loaded",
            "Bank statement navigation may be unavailable.",
            navigationError,
        ],
        [
            "next-number",
            "Next statement number could not be loaded",
            "A number could not be assigned to the new bank statement.",
            nextNumberError,
        ],
        [
            "latest-number",
            "Latest statement number could not be checked",
            "The bank statement number could not be validated before saving.",
            latestNumberError,
        ],
        [
            "save",
            "Bank statement could not be saved",
            "Your changes were not saved.",
            saveError,
        ],
    ] as const;

    if (!errors.some(([, , , error]) => error)) return null;

    return (
        <div className="mb-6 space-y-2">
            {errors.map(
                ([key, title, description, error]) =>
                    error && (
                        <ErrorAlert
                            key={key}
                            title={title}
                            description={description}
                            error={error}
                        />
                    ),
            )}
        </div>
    );
}

export default BankStatementErrors;
