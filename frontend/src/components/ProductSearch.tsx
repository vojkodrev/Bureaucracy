import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent, SyntheticEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pager from '@/components/Pager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { ComponentMode } from '@/lib/component-mode'
import { optionalFilter } from '@/lib/filters'
import { formatCurrency } from '@/lib/formatters'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import type { Product, ProductPage } from '@/lib/product-types'

type SearchForm = {
    productCode: string
    productName: string
    page: string
    pageSize: string
}

type SearchProductsResponse = {
    data?: { searchProducts: ProductPage }
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
}

const searchProductsQuery = `
    query SearchProducts(
        $businessYear: String!
        $productCode: String
        $productName: String
        $page: Int
        $pageSize: Int
    ) {
        searchProducts(
            businessYear: $businessYear
            productCode: $productCode
            productName: $productName
            page: $page
            pageSize: $pageSize
        ) {
            products {
                id
                productCode
                name
                barcode
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

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const emptyProducts: Product[] = []

function searchFormFromParams(searchParams: URLSearchParams): SearchForm {
    return {
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
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
    return searchParams
}

function ProductSearch({ mode, onProductSelect }: ProductSearchProps) {
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
        () => new URLSearchParams(activeSearch).toString(),
        [activeSearch],
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
    const error = isLoading ? null : searchResult.error
    const firstProduct =
        productPage && productPage.totalCount > 0
            ? (productPage.page - 1) * productPage.pageSize + 1
            : 0
    const lastProduct = productPage
        ? Math.min(productPage.page * productPage.pageSize, productPage.totalCount)
        : 0

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
    }, [activeSearch, searchKey])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        const formData = new FormData(event.currentTarget)
        const nextSearch: SearchForm = {
            productCode: String(formData.get('productCode') ?? '').trim(),
            productName: String(formData.get('productName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: activeSearch.pageSize,
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

    function selectProduct(product: Product) {
        setSelectedProductId(product.id)
        onProductSelect?.(product)
    }

    return (
        <div className="p-4">
            <form
                key={searchKey}
                className="max-w-2xl"
                onSubmit={submitSearch}
                onReset={clearSearch}
            >
                <Card>
                    <CardContent>
                        <FieldGroup>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="product-code">Product code</FieldLabel>
                                    <Input
                                        id="product-code"
                                        type="search"
                                        name="productCode"
                                        defaultValue={activeSearch.productCode}
                                        autoComplete="off"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="product-name">Product name</FieldLabel>
                                    <Input
                                        id="product-name"
                                        type="search"
                                        name="productName"
                                        defaultValue={activeSearch.productName}
                                        autoComplete="off"
                                    />
                                </Field>
                            </div>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit">Search</Button>
                        <Button type="reset" variant="outline">Clear</Button>
                    </CardFooter>
                </Card>
            </form>

            <div className="mt-8">
                {productPage && (
                    <Pager
                        firstItem={firstProduct}
                        lastItem={lastProduct}
                        page={productPage.page}
                        totalItems={productPage.totalCount}
                        totalPages={productPage.totalPages}
                        onPageChange={changePage}
                    />
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Barcode</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Net price</TableHead>
                            <TableHead className="text-right">Gross price</TableHead>
                            <TableHead className="text-right">Tax rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Loading products…
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !error && products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            !error &&
                            products.map((product) => (
                                <TableRow
                                    key={product.id}
                                    data-state={
                                        selectedProductId === product.id
                                            ? 'selected'
                                            : undefined
                                    }
                                    className="cursor-pointer"
                                    tabIndex={0}
                                    onClick={() => selectProduct(product)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            selectProduct(product)
                                        }
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        {product.productCode ?? '—'}
                                    </TableCell>
                                    <TableCell>{product.name ?? '—'}</TableCell>
                                    <TableCell>{product.barcode || '—'}</TableCell>
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
                                    <TableCell className="text-right">
                                        {product.taxRate == null
                                            ? '—'
                                            : `${product.taxRate}%`}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default ProductSearch
