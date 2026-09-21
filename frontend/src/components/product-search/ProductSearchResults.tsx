import { Link } from 'react-router-dom'
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
    const columnCount = showInvoiceCount ? 8 : 7

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
            <Table>
                <TableHeader>
                    <TableRow>
                        {productSortColumns.map(({ key, label, alignRight }) => (
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
                    {isLoading && (
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
                    {!isLoading && products.map((product) => (
                        <TableRow
                            key={product.id}
                            data-state={selectedProductId === product.id ? 'selected' : undefined}
                            className="relative cursor-pointer"
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
                            <TableCell className="font-medium">
                                {isPageMode && product.productCode && (
                                    <Link
                                        to={`/product/${encodeURIComponent(product.productCode)}`}
                                        aria-label={`Open product ${product.productCode}`}
                                        className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                                    />
                                )}
                                {product.productCode ?? '—'}
                            </TableCell>
                            <TableCell>{product.name ?? '—'}</TableCell>
                            <TableCell>{product.unit ?? '—'}</TableCell>
                            <TableCell className="text-right">
                                {product.netPrice == null
                                    ? '—'
                                    : formatCurrency(product.netPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                                {product.grossPrice == null
                                    ? '—'
                                    : formatCurrency(product.grossPrice)}
                            </TableCell>
                            <TableCell>{product.taxCode ?? '—'}</TableCell>
                            <TableCell className="text-right">
                                {product.taxRate == null ? '—' : `${product.taxRate}%`}
                            </TableCell>
                            {showInvoiceCount && (
                                <TableCell className="text-right">
                                    {invoiceCountsLoading
                                        ? '…'
                                        : invoiceCountsError
                                            ? '—'
                                            : product.productCode
                                                ? invoiceCounts[product.productCode] ?? 0
                                                : 0}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ProductSearchResults
