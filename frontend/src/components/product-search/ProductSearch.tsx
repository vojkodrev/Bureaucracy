import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent, SyntheticEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { ComponentMode } from '@/lib/component-mode'
import { optionalFilter } from '@/lib/filters'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type { Product, ProductPage } from '@/lib/product-types'
import ProductSearchErrors from './ProductSearchErrors'
import ProductSearchForm from './ProductSearchForm'
import ProductSearchResults from './ProductSearchResults'
import { productSortColumns } from './product-search-columns'
import type { ProductSearchForm as SearchForm, ProductSortColumn } from './types'

type SearchProductsResponse = {
    data?: { searchProducts: ProductPage }
    errors?: { message: string }[]
}

type ProductInvoiceCountsResponse = {
    data?: {
        productInvoiceCounts: { productCode: string, invoiceCount: number }[]
    }
    errors?: { message: string }[]
}

type ProductSearchResult = {
    searchKey: string
    productPage: ProductPage | null
    error: string | null
}

type ProductSearchProps = {
    mode: ComponentMode
    onProductSelect?: (product: Product) => void
    showSearchFields?: boolean
    showInvoiceCount?: boolean
    similarName?: string
}

const searchProductsQuery = `
    query SearchProducts(
        $businessYear: String!
        $productCode: String
        $productName: String
        $similarName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchProducts(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            similarName: $similarName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            products {
                id
                productCode
                name
                unit
                netPrice
                grossPrice
                taxRate
                taxCode
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const productInvoiceCountsQuery = `
    query ProductInvoiceCounts($businessYear: String!, $productCodes: [String!]!) {
        productInvoiceCounts(businessYear: $businessYear, productCodes: $productCodes) {
            productCode
            invoiceCount
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const emptyProducts: Product[] = []

function searchFormFromParams(searchParams: URLSearchParams): SearchForm {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const sortBy = productSortColumns.some(({ key }) => key === sortByValue)
        ? sortByValue as ProductSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

function searchParamsFromForm(search: SearchForm): URLSearchParams {
    const searchParams = new URLSearchParams()

    if (search.productCode) {
        searchParams.set('productCode', search.productCode)
    }
    if (search.productName) {
        searchParams.set('productName', search.productName)
    }
    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}

function ProductSearch({
    mode,
    onProductSelect,
    showSearchFields = true,
    showInvoiceCount = false,
    similarName,
}: ProductSearchProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const pageSearch = useMemo(
        () => searchFormFromParams(searchParams),
        [searchParams],
    )
    const [dialogSearch, setDialogSearch] = useState<SearchForm>(() =>
        searchFormFromParams(new URLSearchParams()),
    )
    const activeSearch = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(
        () => new URLSearchParams({
            ...activeSearch,
            similarName: similarName ?? '',
        }).toString(),
        [activeSearch, similarName],
    )
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [searchResult, setSearchResult] = useState<ProductSearchResult>({
        searchKey: '__initial__',
        productPage: null,
        error: null,
    })
    const isLoading = searchResult.searchKey !== searchKey
    const productPage = isLoading ? null : searchResult.productPage
    const products = productPage?.products ?? emptyProducts
    const invoiceCountsKey = showInvoiceCount && productPage
        ? `${searchKey}:${products.map(({ productCode }) => productCode ?? '').join(',')}`
        : '__disabled__'
    const [invoiceCountResult, setInvoiceCountResult] = useState<{
        key: string
        counts: Record<string, number>
        error: boolean
    }>({ key: '__initial__', counts: {}, error: false })
    const invoiceCountsLoading = showInvoiceCount && productPage != null &&
        invoiceCountResult.key !== invoiceCountsKey
    const error = isLoading ? null : searchResult.error
    useEffect(() => {
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: searchProductsQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    productCode: optionalFilter(activeSearch.productCode),
                    productName: optionalFilter(activeSearch.productName),
                    similarName: optionalFilter(similarName ?? ''),
                    sortBy: activeSearch.sortBy || null,
                    sortDirection: activeSearch.sortDirection || null,
                    page: positiveInteger(activeSearch.page, defaultPage),
                    pageSize: Math.min(
                        positiveInteger(activeSearch.pageSize, defaultPageSize),
                        maximumPageSize,
                    ),
                },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Product search failed (${response.status})`)
                }

                const result = (await response.json()) as SearchProductsResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }

                setSearchResult({
                    searchKey,
                    productPage: result.data?.searchProducts ?? null,
                    error: null,
                })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }

                setSearchResult({
                    searchKey,
                    productPage: null,
                    error:
                        requestError instanceof Error
                            ? requestError.message
                            : 'Product search failed',
                })
            })

        return () => abortController.abort()
    }, [activeSearch, searchKey, similarName])

    useEffect(() => {
        if (!showInvoiceCount || !productPage) return

        const productCodes = products.flatMap(({ productCode }) =>
            productCode ? [productCode] : [],
        )
        if (productCodes.length === 0) return

        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: productInvoiceCountsQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    productCodes,
                },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Product invoice counts failed (${response.status})`)
                }
                const result = (await response.json()) as ProductInvoiceCountsResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }
                const counts = Object.fromEntries(
                    (result.data?.productInvoiceCounts ?? []).map(
                        ({ productCode, invoiceCount }) => [productCode, invoiceCount],
                    ),
                )
                setInvoiceCountResult({ key: invoiceCountsKey, counts, error: false })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }
                setInvoiceCountResult({ key: invoiceCountsKey, counts: {}, error: true })
            })

        return () => abortController.abort()
    }, [invoiceCountsKey, productPage, products, showInvoiceCount])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        const formData = new FormData(event.currentTarget)
        const nextSearch: SearchForm = {
            productCode: String(formData.get('productCode') ?? '').trim(),
            productName: String(formData.get('productName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: activeSearch.pageSize,
            sortBy: activeSearch.sortBy,
            sortDirection: activeSearch.sortDirection,
        }

        setSelectedProductId(null)
        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch(event: SyntheticEvent<HTMLFormElement>) {
        event.stopPropagation()
        setSelectedProductId(null)
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(searchFormFromParams(new URLSearchParams()))
        }
    }

    function changePage(page: number) {
        const pageSize = String(productPage?.pageSize ?? defaultPageSize)
        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm({
                ...activeSearch,
                page: String(page),
                pageSize,
            }))
        } else {
            setDialogSearch((currentSearch) => ({
                ...currentSearch,
                page: String(page),
                pageSize,
            }))
        }
    }

    function changePageSize(pageSize: number) {
        const nextSearch = { ...activeSearch, page: '1', pageSize: String(pageSize) }
        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function changeSort(sortBy: ProductSortColumn) {
        const sortDirection = activeSearch.sortBy !== sortBy
            ? 'asc'
            : activeSearch.sortDirection === 'asc'
                ? 'desc'
                : ''
        const nextSearch: SearchForm = {
            ...activeSearch,
            page: String(defaultPage),
            sortBy: sortDirection ? sortBy : '',
            sortDirection,
        }

        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function selectProduct(product: Product) {
        setSelectedProductId(product.id)
        onProductSelect?.(product)
    }

    return (
        <div className="p-4">
            <ProductSearchErrors error={error} />
            {showSearchFields && (
                <ProductSearchForm
                    key={searchKey}
                    search={activeSearch}
                    onSubmit={submitSearch}
                    onReset={clearSearch}
                />
            )}
            {!error && (
                <ProductSearchResults
                    search={activeSearch}
                    productPage={productPage}
                    products={products}
                    isLoading={isLoading}
                    mode={mode}
                    showSearchFields={showSearchFields}
                    showInvoiceCount={showInvoiceCount}
                    selectedProductId={selectedProductId}
                    invoiceCounts={invoiceCountResult.counts}
                    invoiceCountsLoading={invoiceCountsLoading}
                    invoiceCountsError={invoiceCountResult.error}
                    onProductSelect={selectProduct}
                    onPageChange={changePage}
                    onPageSizeChange={changePageSize}
                    onSort={changeSort}
                />
            )}
        </div>
    )
}

export default ProductSearch
