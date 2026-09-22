import { ComponentMode } from '@/lib/component-mode'
import type { Product } from '@/lib/product-types'
import { useProductInvoiceCounts } from './hooks/useProductInvoiceCounts'
import { useProductSearchResults } from './hooks/useProductSearchResults'
import { useProductSearchSelection } from './hooks/useProductSearchSelection'
import { useProductSearchState } from './hooks/useProductSearchState'
import ProductSearchErrors from './ProductSearchErrors'
import ProductSearchForm from './ProductSearchForm'
import ProductSearchResults from './ProductSearchResults'

type ProductSearchProps = {
    mode: ComponentMode
    onProductSelect?: (product: Product) => void
    showSearchFields?: boolean
    showInvoiceCount?: boolean
    similarName?: string
}

function ProductSearch({
    mode,
    onProductSelect,
    showSearchFields = true,
    showInvoiceCount = false,
    similarName,
}: ProductSearchProps) {
    const searchState = useProductSearchState(mode, similarName)
    const { search, searchKey } = searchState
    const { productPage, products, isLoading, error } = useProductSearchResults(
        search,
        searchKey,
        similarName,
    )
    const selection = useProductSearchSelection(onProductSelect)
    const invoiceCounts = useProductInvoiceCounts(showInvoiceCount, productPage, searchKey)

    function updateSearchAndClearSelection(nextSearch: typeof search) {
        selection.clearSelection()
        searchState.updateSearch(nextSearch)
    }

    function clearSearchAndSelection() {
        selection.clearSelection()
        searchState.clearSearch()
    }

    return (
        <div className="p-4">
            <ProductSearchErrors error={error} />
            {showSearchFields && (
                <ProductSearchForm
                    key={searchKey}
                    search={search}
                    onSubmit={updateSearchAndClearSelection}
                    onReset={clearSearchAndSelection}
                />
            )}
            {!error && (
                <ProductSearchResults
                    search={search}
                    productPage={productPage}
                    products={products}
                    isLoading={isLoading}
                    mode={mode}
                    showSearchFields={showSearchFields}
                    showInvoiceCount={showInvoiceCount}
                    selectedProductId={selection.selectedProductId}
                    invoiceCounts={invoiceCounts.counts}
                    invoiceCountsLoading={invoiceCounts.isLoading}
                    invoiceCountsError={invoiceCounts.error}
                    onProductSelect={selection.selectProduct}
                    onPageChange={(page) => searchState.changePage(page, productPage?.pageSize)}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
        </div>
    )
}

export default ProductSearch
