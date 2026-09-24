import ErrorAlert from '@/components/ErrorAlert'

type BankStatementSearchErrorsProps = {
    error: string | null
}

function BankStatementSearchErrors({ error }: BankStatementSearchErrorsProps) {
    if (!error) return null

    return (
        <div className="mb-6 max-w-4xl">
            <ErrorAlert
                title="Bank statements could not be loaded"
                description="The bank statement search could not be completed."
                error={error}
            />
        </div>
    )
}

export default BankStatementSearchErrors
