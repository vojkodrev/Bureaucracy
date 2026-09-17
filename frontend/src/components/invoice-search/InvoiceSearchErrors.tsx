import ErrorAlert from '@/components/ErrorAlert'

type InvoiceSearchErrorsProps = {
    printError: string | null
    searchError: string | null
}

function InvoiceSearchErrors({ printError, searchError }: InvoiceSearchErrorsProps) {
    if (!printError && !searchError) return null

    return (
        <div className="mb-6 max-w-2xl space-y-2">
            {printError && (
                <ErrorAlert
                    title="Invoice report could not be printed"
                    description="The invoice report PDF could not be opened."
                    error={printError}
                />
            )}
            {searchError && (
                <ErrorAlert
                    title="Invoices could not be loaded"
                    description="The invoice search could not be completed."
                    error={searchError}
                />
            )}
        </div>
    )
}

export default InvoiceSearchErrors
