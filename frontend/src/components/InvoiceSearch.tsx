import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import Pager from '@/components/Pager'
import SortableTableHead from '@/components/SortableTableHead'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateFromSearchValue, optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ComponentMode } from '@/lib/component-mode'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type SearchForm = {
    invoiceNumber: string
    customerId: string
    customerName: string
    from: string
    to: string
    page: string
    pageSize: string
    sortBy: InvoiceSortColumn | ''
    sortDirection: SortDirection | ''
}

type InvoiceSortColumn =
    | 'invoiceNumber'
    | 'customer'
    | 'amount'
    | 'issueDate'
    | 'dueDate'
    | 'paymentDate'
type SortDirection = 'asc' | 'desc'

const invoiceSortColumns: InvoiceSortColumn[] = [
    'invoiceNumber',
    'customer',
    'amount',
    'issueDate',
    'dueDate',
    'paymentDate',
]

type SearchInvoicesResponse = {
    data?: { searchInvoices: InvoicePage }
    errors?: { message: string }[]
}

type InvoiceSearchResult = {
    searchKey: string
    invoicePage: InvoicePage | null
    error: string | null
}

type InvoiceSearchProps = {
    mode: ComponentMode
    onInvoiceSelect?: (invoice: Invoice) => void
}

const searchInvoicesQuery = `
    query SearchInvoices(
        $businessYear: String!
        $invoiceNumber: String
        $customerId: String
        $customerName: String
        $issuedFrom: Time
        $issuedTo: Time
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchInvoices(
            businessYear: $businessYear
            invoiceNumber: $invoiceNumber
            customerId: $customerId
            customerName: $customerName
            issuedFrom: $issuedFrom
            issuedTo: $issuedTo
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            invoices {
                invoiceNumber
                customerCode
                customerName
                amount
                issueDate
                dueDate
                paymentDate
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const emptyInvoices: Invoice[] = []

function searchFormFromParams(searchParams: URLSearchParams): SearchForm {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const sortBy = invoiceSortColumns.includes(sortByValue as InvoiceSortColumn)
        ? sortByValue as InvoiceSortColumn
        : ''
    const sortDirection = sortDirectionValue === 'asc' || sortDirectionValue === 'desc'
        ? sortDirectionValue
        : ''

    return {
        invoiceNumber: searchParams.get('invoiceNumber') ?? '',
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        page: searchParams.get('page') ?? '1',
        pageSize:
            searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

function searchParamsFromForm(search: SearchForm): URLSearchParams {
    const searchParams = new URLSearchParams()

    for (const key of ['invoiceNumber', 'customerId', 'customerName', 'from', 'to'] as const) {
        if (search[key]) {
            searchParams.set(key, search[key])
        }
    }

    searchParams.set('page', search.page)
    searchParams.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        searchParams.set('sortBy', search.sortBy)
        searchParams.set('sortDirection', search.sortDirection)
    }
    return searchParams
}

function InvoiceSearch({ mode, onInvoiceSelect }: InvoiceSearchProps) {
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
    const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)
    const [customerId, setCustomerId] = useState(activeSearch.customerId)
    const [customerName, setCustomerName] = useState(activeSearch.customerName)
    const [invoiceDateFrom, setInvoiceDateFrom] = useState(() =>
        dateFromSearchValue(activeSearch.from),
    )
    const [invoiceDateTo, setInvoiceDateTo] = useState(() =>
        dateFromSearchValue(activeSearch.to),
    )
    const [searchResult, setSearchResult] = useState<InvoiceSearchResult>({
        searchKey: '__initial__',
        invoicePage: null,
        error: null,
    })
    const isLoading = searchResult.searchKey !== searchKey
    const invoicePage = isLoading ? null : searchResult.invoicePage
    const invoices = invoicePage?.invoices ?? emptyInvoices
    const error = isLoading ? null : searchResult.error
    const firstInvoice =
        invoicePage && invoicePage.totalCount > 0
            ? (invoicePage.page - 1) * invoicePage.pageSize + 1
            : 0
    const lastInvoice = invoicePage
        ? Math.min(invoicePage.page * invoicePage.pageSize, invoicePage.totalCount)
        : 0

    useEffect(() => {
        setCustomerId(activeSearch.customerId)
        setCustomerName(activeSearch.customerName)
        setInvoiceDateFrom(dateFromSearchValue(activeSearch.from))
        setInvoiceDateTo(dateFromSearchValue(activeSearch.to))
    }, [activeSearch.customerId, activeSearch.customerName, activeSearch.from, activeSearch.to])

    useEffect(() => {
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: searchInvoicesQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    invoiceNumber: optionalFilter(activeSearch.invoiceNumber),
                    customerId: optionalFilter(activeSearch.customerId),
                    customerName: optionalFilter(activeSearch.customerName),
                    issuedFrom: optionalDate(activeSearch.from),
                    issuedTo: optionalDate(activeSearch.to),
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
                    throw new Error(`Invoice search failed (${response.status})`)
                }

                const result = (await response.json()) as SearchInvoicesResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }

                setSearchResult({
                    searchKey,
                    invoicePage: result.data?.searchInvoices ?? null,
                    error: null,
                })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }

                setSearchResult({
                    searchKey,
                    invoicePage: null,
                    error:
                        requestError instanceof Error
                            ? requestError.message
                            : 'Invoice search failed',
                })
            })

        return () => abortController.abort()
    }, [activeSearch, searchKey])

    const summary = useMemo(() => {
        const total = invoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
        const unpaidInvoices = invoices.filter((invoice) => !invoice.paymentDate)
        const pastDueInvoices = unpaidInvoices.filter(
            (invoice) => invoice.dueDate && new Date(invoice.dueDate) < new Date(),
        )
        const paidInvoices = invoices.filter((invoice) => invoice.paymentDate)

        return {
            total,
            unpaid: unpaidInvoices.reduce(
                (sum, invoice) => sum + (invoice.amount ?? 0),
                0,
            ),
            pastDue: pastDueInvoices.reduce(
                (sum, invoice) => sum + (invoice.amount ?? 0),
                0,
            ),
            paid: paidInvoices.reduce(
                (sum, invoice) => sum + (invoice.amount ?? 0),
                0,
            ),
        }
    }, [invoices])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const nextSearch: SearchForm = {
            invoiceNumber: String(formData.get('invoiceNumber') ?? '').trim(),
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            from: String(formData.get('from') ?? ''),
            to: String(formData.get('to') ?? ''),
            page: '1',
            pageSize: activeSearch.pageSize,
            sortBy: activeSearch.sortBy,
            sortDirection: activeSearch.sortDirection,
        }

        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        setInvoiceDateFrom(undefined)
        setInvoiceDateTo(undefined)
        setSelectedInvoiceNumber(null)
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(searchFormFromParams(new URLSearchParams()))
        }
    }

    function changePage(page: number) {
        const pageSize = String(invoicePage?.pageSize ?? defaultPageSize)
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

    function changeSort(sortBy: InvoiceSortColumn) {
        const sortDirection = activeSearch.sortBy !== sortBy
            ? 'asc'
            : activeSearch.sortDirection === 'asc'
                ? 'desc'
                : ''
        const nextSearch: SearchForm = {
            ...activeSearch,
            page: '1',
            sortBy: sortDirection ? sortBy : '',
            sortDirection,
        }

        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function selectInvoice(invoice: Invoice) {
        setSelectedInvoiceNumber(invoice.invoiceNumber)
        onInvoiceSelect?.(invoice)
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
                            <Field>
                                <FieldLabel htmlFor="invoice-number">Invoice number</FieldLabel>
                                <Input
                                    id="invoice-number"
                                    type="search"
                                    name="invoiceNumber"
                                    defaultValue={activeSearch.invoiceNumber}
                                    autoComplete="off"
                                />
                            </Field>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <CustomerPickerField
                                    id="customer-id"
                                    label="Customer ID"
                                    name="customerId"
                                    customerId={customerId}
                                    onCustomerIdChange={setCustomerId}
                                    onCustomerNameChange={setCustomerName}
                                />
                                <Field>
                                    <FieldLabel htmlFor="customer-name">Customer name</FieldLabel>
                                    <Input
                                        id="customer-name"
                                        type="search"
                                        name="customerName"
                                        value={customerName}
                                        autoComplete="off"
                                        onChange={(event) => setCustomerName(event.target.value)}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <DatePickerField
                                    id="invoice-date-from"
                                    label="Invoice date from"
                                    name="from"
                                    date={invoiceDateFrom}
                                    onSelect={setInvoiceDateFrom}
                                />
                                <DatePickerField
                                    id="invoice-date-to"
                                    label="Invoice date to"
                                    name="to"
                                    date={invoiceDateTo}
                                    onSelect={setInvoiceDateTo}
                                />
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
                {invoicePage && (
                    <Pager
                        firstItem={firstInvoice}
                        lastItem={lastInvoice}
                        page={invoicePage.page}
                        totalItems={invoicePage.totalCount}
                        totalPages={invoicePage.totalPages}
                        onPageChange={changePage}
                    />
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            {invoiceSortColumns.map((sortBy) => (
                                <SortableTableHead
                                    key={sortBy}
                                    label={{
                                        invoiceNumber: 'Invoice number',
                                        customer: 'Customer',
                                        amount: 'Amount',
                                        issueDate: 'Invoice date',
                                        dueDate: 'Due date',
                                        paymentDate: 'Payment date',
                                    }[sortBy]}
                                    direction={activeSearch.sortBy === sortBy
                                        ? activeSearch.sortDirection
                                        : ''}
                                    alignRight={sortBy === 'amount'}
                                    onSort={() => changeSort(sortBy)}
                                />
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Loading invoices…
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !error && invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            !error &&
                            invoices.map((invoice) => (
                                <TableRow
                                    key={invoice.invoiceNumber}
                                    data-state={
                                        selectedInvoiceNumber === invoice.invoiceNumber
                                            ? 'selected'
                                            : undefined
                                    }
                                    className="cursor-pointer"
                                    tabIndex={0}
                                    onClick={() => selectInvoice(invoice)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault()
                                            selectInvoice(invoice)
                                        }
                                    }}
                                >
                                    <TableCell className="font-medium">
                                        {invoice.invoiceNumber}
                                    </TableCell>
                                    <TableCell>
                                        {invoice.customerName ?? invoice.customerCode ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(invoice.amount ?? 0)}
                                    </TableCell>
                                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                    <TableCell>{formatDate(invoice.paymentDate)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-8 max-w-sm">
                <h2 className="mb-2 text-sm font-medium">Summary</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total amount</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(summary.total)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Unpaid</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(summary.unpaid)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Past due</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(summary.pastDue)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Paid</TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency(summary.paid)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default InvoiceSearch
