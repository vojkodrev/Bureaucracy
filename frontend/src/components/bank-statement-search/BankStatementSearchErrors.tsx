import ErrorAlert from '@/components/ErrorAlert'

export type BankStatementSearchError = readonly [
    key: string,
    title: string,
    description: string,
    error: string | null,
]

type BankStatementSearchErrorsProps = {
    errors: readonly BankStatementSearchError[]
}

function BankStatementSearchErrors({ errors }: BankStatementSearchErrorsProps) {
    return (
        errors.some(([, , , currentError]) => currentError) && (
            <div className="mb-6 max-w-4xl space-y-2">
                {errors.map(([key, title, description, currentError]) => currentError && (
                    <ErrorAlert
                        key={key}
                        title={title}
                        description={description}
                        error={currentError}
                    />
                ))}
            </div>
        )
    )
}

export default BankStatementSearchErrors
