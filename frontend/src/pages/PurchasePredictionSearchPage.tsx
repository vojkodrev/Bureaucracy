import ErrorAlert from '@/components/ErrorAlert'
import {
    PurchasePredictionSearchForm,
    PurchasePredictionSearchResults,
} from '@/components/purchase-prediction-search'
import PurchasePredictionSearchMenu from '@/components/purchase-prediction-search/PurchasePredictionSearchMenu'
import { usePurchasePredictionSearchPrint } from '@/components/purchase-prediction-search/hooks/usePurchasePredictionSearchPrint'
import { usePurchasePredictionSearchResults } from '@/components/purchase-prediction-search/hooks/usePurchasePredictionSearchResults'
import { usePurchasePredictionSearchState } from '@/components/purchase-prediction-search/hooks/usePurchasePredictionSearchState'
import { usePurchasePredictionSnapshots } from '@/components/purchase-prediction-search/hooks/usePurchasePredictionSnapshots'
import { isStorageOnlyUser } from '@/lib/auth'

export default function PurchasePredictionSearchPage() {
    const searchState = usePurchasePredictionSearchState()
    const { search, searchKey } = searchState
    const { page, isLoading, error } = usePurchasePredictionSearchResults(search, searchKey)
    const {
        snapshots,
        isLoading: areSnapshotsLoading,
        error: snapshotsError,
    } = usePurchasePredictionSnapshots()
    const print = usePurchasePredictionSearchPrint({
        search,
        hasResults: Boolean(page?.predictions.length),
        isLoading,
        hasError: Boolean(error),
    })

    return (
        <div className="p-4">
            {print.printError && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Purchase prediction report could not be printed"
                        description="The report PDF could not be opened."
                        error={print.printError}
                    />
                </div>
            )}
            {!isLoading && error && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Purchase predictions could not be loaded"
                        description={
                            'The purchase prediction search could not be completed.'
                        }
                        error={error}
                    />
                </div>
            )}
            {!areSnapshotsLoading && snapshotsError && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Purchase prediction snapshots could not be loaded"
                        description="The available prediction dates could not be loaded."
                        error={snapshotsError}
                    />
                </div>
            )}
            <PurchasePredictionSearchMenu
                disabled={!print.canPrint}
                onPrint={print.printReport}
            />
            <PurchasePredictionSearchForm
                key={searchKey}
                search={search}
                snapshots={snapshots}
                selectedSnapshotId={search.snapshotId || page?.snapshotId || ''}
                onSubmit={searchState.updateSearch}
                onReset={searchState.clearSearch}
            />
            {!error && (
                <PurchasePredictionSearchResults
                    result={page}
                    isLoading={isLoading}
                    allowCustomerNavigation={!isStorageOnlyUser()}
                    onPageChange={(nextPage) => searchState.changePage(nextPage, page?.pageSize)}
                    onPageSizeChange={searchState.changePageSize}
                />
            )}
        </div>
    )
}
