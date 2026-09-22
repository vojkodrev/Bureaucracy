import ErrorAlert from '@/components/ErrorAlert'
import { useInventoryItemSearchResults } from './hooks/useInventoryItemSearchResults'
import { useInventoryItemSearchState } from './hooks/useInventoryItemSearchState'
import InventoryItemSearchForm from './InventoryItemSearchForm'
import InventoryItemSearchResults from './InventoryItemSearchResults'

type InventoryItemSearchProps = {
    showSearchFields?: boolean
    similarName?: string
}

export default function InventoryItemSearch({
    showSearchFields = true,
    similarName,
}: InventoryItemSearchProps) {
    const searchState = useInventoryItemSearchState(similarName)
    const { search, searchKey } = searchState
    const { itemPage, items, isLoading, error } = useInventoryItemSearchResults(
        search,
        searchKey,
        similarName,
    )

    return (
        <div className="p-4">
            {error && (
                <div className="mb-6 max-w-2xl">
                    <ErrorAlert
                        title="Inventory items could not be loaded"
                        description="The inventory item search could not be completed."
                        error={error}
                    />
                </div>
            )}
            {showSearchFields && (
                <InventoryItemSearchForm
                    key={searchKey}
                    search={search}
                    onSubmit={searchState.updateSearch}
                    onReset={searchState.clearSearch}
                />
            )}
            {!error && (
                <InventoryItemSearchResults
                    search={search}
                    itemPage={itemPage}
                    items={items}
                    isLoading={isLoading}
                    showSearchFields={showSearchFields}
                    onPageChange={(page) => searchState.changePage(page, itemPage?.pageSize)}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
        </div>
    )
}
