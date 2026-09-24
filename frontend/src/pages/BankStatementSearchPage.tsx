import BankStatementSearchErrors from '@/components/bank-statement-search/BankStatementSearchErrors'
import BankStatementSearchForm from '@/components/bank-statement-search/BankStatementSearchForm'
import BankStatementSearchResults from '@/components/bank-statement-search/BankStatementSearchResults'
import { useBankStatementSearchResults } from '@/components/bank-statement-search/hooks/useBankStatementSearchResults'
import { useBankStatementSearchState } from '@/components/bank-statement-search/hooks/useBankStatementSearchState'

function BankStatementSearchPage() {
    const searchState = useBankStatementSearchState()
    const { search, searchKey } = searchState
    const { statementPage, groups, isLoading, error } = useBankStatementSearchResults(
        search,
        searchKey,
    )

    return (
        <div className="p-4">
            <BankStatementSearchErrors error={error} />
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
