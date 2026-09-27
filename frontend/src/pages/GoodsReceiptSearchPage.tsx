import ErrorAlert from '@/components/ErrorAlert'
import GoodsReceiptSearchForm from '@/components/goods-receipt-search/GoodsReceiptSearchForm'
import GoodsReceiptSearchResults from '@/components/goods-receipt-search/GoodsReceiptSearchResults'
import {
    useGoodsReceiptSearchResults,
} from '@/components/goods-receipt-search/hooks/useGoodsReceiptSearchResults'
import {
    useGoodsReceiptSearchState,
} from '@/components/goods-receipt-search/hooks/useGoodsReceiptSearchState'

export default function GoodsReceiptSearchPage() {
    const state = useGoodsReceiptSearchState()
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
            <GoodsReceiptSearchForm
                key={state.searchKey}
                search={state.search}
                onSubmit={state.updateSearch}
                onReset={state.clearSearch}
            />
            {!result.error && (
                <GoodsReceiptSearchResults
                    page={result.page}
                    isLoading={result.isLoading}
                    search={state.search}
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
