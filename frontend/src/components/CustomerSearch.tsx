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
}

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
        $page: Int
        $pageSize: Int
    ) {
        searchCustomers(
            businessYear: $businessYear
            customerId: $customerId
            customerName: $customerName
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
    return {
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        page: searchParams.get('page') ?? String(defaultPage),
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
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
                            <TableHead>Customer ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Tax number</TableHead>
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
