import ErrorAlert from '@/components/ErrorAlert'
import { ComponentMode } from '@/lib/component-mode'
import type { GoodsReceipt } from '@/lib/goods-receipt-types'
import GoodsReceiptSearchForm from './GoodsReceiptSearchForm'
import GoodsReceiptSearchResults from './GoodsReceiptSearchResults'
import { useGoodsReceiptSearchResults } from './hooks/useGoodsReceiptSearchResults'
import { useGoodsReceiptSearchState } from './hooks/useGoodsReceiptSearchState'

type Props = {
    mode: ComponentMode
    showSearchFields?: boolean
    defaultProductCode?: string
    onGoodsReceiptSelect?: (receipt: GoodsReceipt) => void
}

export default function GoodsReceiptSearch({
    mode,
    showSearchFields = true,
    defaultProductCode,
    onGoodsReceiptSelect,
}: Props) {
    const state = useGoodsReceiptSearchState(mode, defaultProductCode)
    const result = useGoodsReceiptSearchResults(state.search, state.searchKey)

    return (
        <div className="p-4">
            {result.error && (
                <ErrorAlert
                    title="Goods receipts could not be loaded"
                    description="The goods receipt search results could not be retrieved."
                    error={result.error}
                />
            )}
            {showSearchFields && (
                <GoodsReceiptSearchForm
                    key={state.searchKey}
                    search={state.search}
                    onSubmit={state.updateSearch}
                    onReset={state.clearSearch}
                />
            )}
            {!result.error && (
                <GoodsReceiptSearchResults
                    page={result.page}
                    isLoading={result.isLoading}
                    mode={mode}
                    search={state.search}
                    showSearchFields={showSearchFields}
                    onGoodsReceiptSelect={onGoodsReceiptSelect}
                    onPageChange={(page) =>
                        state.changePage(page, result.page?.pageSize)
                    }
                    onPageSizeChange={state.changePageSize}
                    onSort={state.changeSort}
                />
            )}
        </div>
    )
}
