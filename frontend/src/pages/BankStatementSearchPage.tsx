import BankStatementSearchErrors from '@/components/bank-statement-search/BankStatementSearchErrors'
import type { BankStatementSearchError } from '@/components/bank-statement-search/BankStatementSearchErrors'
import BankStatementSearchForm from '@/components/bank-statement-search/BankStatementSearchForm'
import BankStatementSearchResults from '@/components/bank-statement-search/BankStatementSearchResults'
import InvoicePaymentMismatchAlert from '@/components/bank-statement-search/InvoicePaymentMismatchAlert'
import MissingBankStatementsAlert from '@/components/bank-statement-search/MissingBankStatementsAlert'
import { useBankStatementSearchResults } from '@/components/bank-statement-search/hooks/useBankStatementSearchResults'
import { useBankStatementSearchState } from '@/components/bank-statement-search/hooks/useBankStatementSearchState'
import { useMissingBankStatementDates } from '@/components/bank-statement-search/hooks/useMissingBankStatementDates'
import { useBankStatementInvoicePayments } from '@/components/bank-statement-search/hooks/useBankStatementInvoicePayments'
import BankStatementSearchMenu from '@/components/bank-statement-search/BankStatementSearchMenu'
import { useBankStatementSearchPrint } from '@/components/bank-statement-search/hooks/useBankStatementSearchPrint'

function BankStatementSearchPage() {
    const searchState = useBankStatementSearchState()
    const { search, searchKey } = searchState
    const { statementPage, groups, isLoading, error } = useBankStatementSearchResults(
        search,
        searchKey,
    )
    const missingStatements = useMissingBankStatementDates()
    const invoicePayments = useBankStatementInvoicePayments(statementPage, searchKey)
    const print = useBankStatementSearchPrint({
        search,
        hasOutflows: statementPage?.entries.some((entry) => (entry.outflow ?? 0) > 0) ?? false,
        isLoading,
        hasError: Boolean(error),
    })
    const errors: BankStatementSearchError[] = [
        [
            'search',
            'Bank statements could not be loaded',
            'The bank statement search could not be completed.',
            error,
        ],
        [
            'print',
            'Bank statement report could not be printed',
            'The outflow report PDF could not be opened.',
            print.printError,
        ],
        [
            'invoice-payments',
            'Invoice payments could not be checked',
            'Payment date and amount mismatches could not be checked.',
            invoicePayments.error,
        ],
        [
            'missing-dates',
            'Missing bank statements could not be checked',
            'The business-year completeness check could not be completed.',
            missingStatements.error,
        ],
    ]

    return (
        <div className="p-4">
            <BankStatementSearchErrors errors={errors} />
            <BankStatementSearchMenu
                reportDisabled={!print.canPrint}
                onPrintReport={print.printReport}
            />
            <MissingBankStatementsAlert missingDates={missingStatements.missingDates} />
            <InvoicePaymentMismatchAlert
                entries={statementPage?.entries ?? []}
                invoicePayments={invoicePayments.payments}
            />
            <BankStatementSearchForm
                key={searchKey}
                search={search}
                onSubmit={searchState.updateSearch}
                onReset={searchState.clearSearch}
            />
            {!error && (
                <BankStatementSearchResults
                    statementPage={statementPage}
                    groups={groups}
                    invoicePayments={invoicePayments.payments}
                    isLoading={isLoading}
                    search={search}
                    onPageChange={(page) => searchState.changePage(
                        page,
                        statementPage?.pageSize,
                    )}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
        </div>
    )
}

export default BankStatementSearchPage
