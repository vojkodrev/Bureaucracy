import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent, SyntheticEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { ComponentMode } from '@/lib/component-mode'
import type { Customer, CustomerPage } from '@/lib/customer-types'
import { optionalFilter } from '@/lib/filters'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'

type SearchForm = {
    customerId: string
    customerName: string
    page: string
    pageSize: string
    sortBy: CustomerSortColumn | ''
    sortDirection: SortDirection | ''
}

type CustomerSortColumn =
    | 'customerId'
    | 'name'
    | 'address'
    | 'city'
    | 'contact'
    | 'email'
    | 'phone'
    | 'taxNumber'
type SortDirection = 'asc' | 'desc'

const customerSortColumns: { key: CustomerSortColumn, label: string }[] = [
    { key: 'customerId', label: 'Customer ID' },
    { key: 'name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'taxNumber', label: 'Tax number' },
]

type SearchCustomersResponse = {
    data?: { searchCustomers: CustomerPage }
    errors?: { message: string }[]
}

type CustomerSearchResult = {
    searchKey: string
    customerPage: CustomerPage | null
    error: string | null
}

type CustomerSearchProps = {
    mode: ComponentMode
    onCustomerSelect?: (customer: Customer) => void
}

const searchCustomersQuery = `
    query SearchCustomers(
        $businessYear: String!
        $customerId: String
        $customerName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchCustomers(
            businessYear: $businessYear
            customerId: $customerId
            customerName: $customerName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            customers {
                id
                customerId
                name
                address
                postalCode
                city
                country
                contact
                email
                phone
                taxNumber
                registrationNumber
                paymentTerm
                discount
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const emptyCustomers: Customer[] = []

function searchFormFromParams(searchParams: URLSearchParams): SearchForm {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const sortBy = customerSortColumns.some(({ key }) => key === sortByValue)
        ? sortByValue as CustomerSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

function searchParamsFromForm(search: SearchForm): URLSearchParams {
    const searchParams = new URLSearchParams()

    if (search.customerId) {
        searchParams.set('customerId', search.customerId)
    }
    if (search.customerName) {
        searchParams.set('customerName', search.customerName)
    }
    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}

function CustomerSearch({ mode, onCustomerSelect }: CustomerSearchProps) {
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
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    const [searchResult, setSearchResult] = useState<CustomerSearchResult>({
        searchKey: '__initial__',
        customerPage: null,
        error: null,
    })
    const isLoading = searchResult.searchKey !== searchKey
    const customerPage = isLoading ? null : searchResult.customerPage
    const customers = customerPage?.customers ?? emptyCustomers
    const error = isLoading ? null : searchResult.error
    const firstCustomer =
        customerPage && customerPage.totalCount > 0
            ? (customerPage.page - 1) * customerPage.pageSize + 1
            : 0
    const lastCustomer = customerPage
        ? Math.min(
            customerPage.page * customerPage.pageSize,
            customerPage.totalCount,
        )
        : 0

    useEffect(() => {
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: searchCustomersQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    customerId: optionalFilter(activeSearch.customerId),
                    customerName: optionalFilter(activeSearch.customerName),
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
                    throw new Error(`Customer search failed (${response.status})`)
                }

                const result = (await response.json()) as SearchCustomersResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }

                setSearchResult({
                    searchKey,
                    customerPage: result.data?.searchCustomers ?? null,
                    error: null,
                })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }

                setSearchResult({
                    searchKey,
                    customerPage: null,
                    error:
                        requestError instanceof Error
                            ? requestError.message
                            : 'Customer search failed',
                })
            })

        return () => abortController.abort()
    }, [activeSearch, searchKey])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        const formData = new FormData(event.currentTarget)
        const nextSearch: SearchForm = {
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: activeSearch.pageSize,
            sortBy: activeSearch.sortBy,
            sortDirection: activeSearch.sortDirection,
        }

        setSelectedCustomerId(null)
        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch(event: SyntheticEvent<HTMLFormElement>) {
        event.stopPropagation()
        setSelectedCustomerId(null)
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(searchFormFromParams(new URLSearchParams()))
        }
    }

    function changePage(page: number) {
        const pageSize = String(customerPage?.pageSize ?? defaultPageSize)
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

    function changeSort(sortBy: CustomerSortColumn) {
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

    function selectCustomer(customer: Customer) {
        setSelectedCustomerId(customer.id)
        onCustomerSelect?.(customer)
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
                                    <FieldLabel htmlFor="customer-id">Customer ID</FieldLabel>
                                    <Input
                                        id="customer-id"
                                        type="search"
                                        name="customerId"
                                        defaultValue={activeSearch.customerId}
                                        autoComplete="off"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="customer-name">Customer name</FieldLabel>
                                    <Input
                                        id="customer-name"
                                        type="search"
                                        name="customerName"
                                        defaultValue={activeSearch.customerName}
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
                {customerPage && (
                    <Pager
                        firstItem={firstCustomer}
                        lastItem={lastCustomer}
                        page={customerPage.page}
                        totalItems={customerPage.totalCount}
                        totalPages={customerPage.totalPages}
                        onPageChange={changePage}
                    />
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            {customerSortColumns.map(({ key, label }) => (
                                <SortableTableHead
                                    key={key}
                                    label={label}
                                    direction={activeSearch.sortBy === key
                                        ? activeSearch.sortDirection
                                        : ''}
                                    onSort={() => changeSort(key)}
                                />
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Loading customers…
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !error && customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            !error &&
                            customers.map((customer) => (
                                <TableRow
                                    key={customer.id}
                                    data-state={
                                        selectedCustomerId === customer.id
                                            ? 'selected'
                                            : undefined
                                    }
                                    className="cursor-pointer"
                                    tabIndex={0}
                                    onClick={() => selectCustomer(customer)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            selectCustomer(customer)
                                        }
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        {customer.customerId ?? '—'}
                                    </TableCell>
                                    <TableCell>{customer.name ?? '—'}</TableCell>
                                    <TableCell>{customer.address ?? '—'}</TableCell>
                                    <TableCell>
                                        {[customer.postalCode, customer.city]
                                            .filter(Boolean)
                                            .join(' ') || '—'}
                                    </TableCell>
                                    <TableCell>{customer.contact ?? '—'}</TableCell>
                                    <TableCell>{customer.email ?? '—'}</TableCell>
                                    <TableCell>{customer.phone ?? '—'}</TableCell>
                                    <TableCell>{customer.taxNumber ?? '—'}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default CustomerSearch
