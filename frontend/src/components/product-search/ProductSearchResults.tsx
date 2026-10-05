import SearchResultCell from '@/components/SearchResultCell'
import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { formatCurrency } from '@/lib/formatters'
import { isStorageOnlyUser } from '@/lib/auth'
import type { Product, ProductPage } from '@/lib/product-types'
import { productSortColumns } from './product-search-columns'
import type { ProductSearchForm, ProductSortColumn } from './types'

type ProductSearchResultsProps = {
    search: ProductSearchForm
    productPage: ProductPage | null
    products: Product[]
    isLoading: boolean
    mode: ComponentMode
    showSearchFields: boolean
    showInvoiceCount: boolean
    selectedProductId: number | null
    invoiceCounts: Record<string, number>
    invoiceCountsLoading: boolean
    invoiceCountsError: boolean
    onProductSelect: (product: Product) => void
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSort: (sortBy: ProductSortColumn) => void
}

function ProductSearchResults({
    search,
    productPage,
    products,
    isLoading,
    mode,
    showSearchFields,
    showInvoiceCount,
    selectedProductId,
    invoiceCounts,
    invoiceCountsLoading,
    invoiceCountsError,
    onProductSelect,
    onPageChange,
    onPageSizeChange,
    onSort,
}: ProductSearchResultsProps) {
    const firstProduct = productPage && productPage.totalCount > 0
        ? (productPage.page - 1) * productPage.pageSize + 1
        : 0
    const lastProduct = productPage
        ? Math.min(productPage.page * productPage.pageSize, productPage.totalCount)
        : 0
    const isPageMode = mode === ComponentMode.Page
    const showPricing = !isStorageOnlyUser()
    const visibleColumns = productSortColumns.filter(({ containsPricing }) => showPricing || !containsPricing)
    const columnCount = visibleColumns.length + (showInvoiceCount ? 1 : 0)

    return (
        <div className={showSearchFields ? 'mt-8' : undefined}>
            {productPage && (
                <Pager
                    firstItem={firstProduct}
                    lastItem={lastProduct}
                    page={productPage.page}
                    pageSize={productPage.pageSize}
                    totalItems={productPage.totalCount}
                    totalPages={productPage.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table aria-busy={isLoading}>
                <TableHeader>
                    <TableRow>
                        {visibleColumns.map(({ key, label, alignRight }) => (
                            <SortableTableHead
                                key={key}
                                label={label}
                                direction={search.sortBy === key ? search.sortDirection : ''}
                                alignRight={alignRight}
                                onSort={() => onSort(key)}
                            />
                        ))}
                        {showInvoiceCount && (
                            <TableHead className="text-right">Invoices</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && !products.length && (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading products…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && products.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No products found.
                            </TableCell>
                        </TableRow>
                    )}
                    {products.map((product) => (
                        <TableRow
                            key={product.id}
                            data-state={selectedProductId === product.id ? 'selected' : undefined}
                            className="cursor-pointer"
                            tabIndex={isPageMode ? undefined : 0}
                            onClick={isPageMode ? undefined : () => onProductSelect(product)}
                            onKeyDown={isPageMode
                                ? undefined
                                : (event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        onProductSelect(product)
                                    }
                                }}
                        >
                            <SearchResultCell
                                primary
                                to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined}
                                linkLabel={`Open product ${product.productCode}`}
                                className="font-medium"
                            >
                                {product.productCode ?? '—'}
                            </SearchResultCell>
                            <SearchResultCell
                                to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined}
                                linkLabel={`Open product ${product.productCode}`}
                            >{product.name ?? '—'}</SearchResultCell>
                            <SearchResultCell
                                to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined}
                                linkLabel={`Open product ${product.productCode}`}
                            >{product.unit ?? '—'}</SearchResultCell>
                            {showPricing && <SearchResultCell to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined} linkLabel={`Open product ${product.productCode}`} className="text-right">
                                {product.netPrice == null
                                    ? '—'
                                    : formatCurrency(product.netPrice)}
                            </SearchResultCell>}
                            {showPricing && <SearchResultCell to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined} linkLabel={`Open product ${product.productCode}`} className="text-right">
                                {product.grossPrice == null
                                    ? '—'
                                    : formatCurrency(product.grossPrice)}
                            </SearchResultCell>}
                            {showPricing && <SearchResultCell to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined} linkLabel={`Open product ${product.productCode}`}>{product.taxCode ?? '—'}</SearchResultCell>}
                            {showPricing && <SearchResultCell to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined} linkLabel={`Open product ${product.productCode}`} className="text-right">
                                {product.taxRate == null ? '—' : `${product.taxRate}%`}
                            </SearchResultCell>}
                            {showInvoiceCount && (
                                <SearchResultCell
                                    to={isPageMode && product.productCode ? `/product/${encodeURIComponent(product.productCode)}` : undefined}
                                    linkLabel={`Open product ${product.productCode}`}
                                    className="text-right"
                                >
                                    {invoiceCountsLoading
                                        ? '…'
                                        : invoiceCountsError
                                            ? '—'
                                            : product.productCode
                                                ? invoiceCounts[product.productCode] ?? 0
                                                : 0}
                                </SearchResultCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ProductSearchResults
