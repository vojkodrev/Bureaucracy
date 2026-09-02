import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

type Invoice = {
    invoiceNumber: string
    customerCode: string | null
    customerName: string | null
    amount: number | null
    issueDate: string | null
    dueDate: string | null
    paymentDate: string | null
}

type SearchForm = {
    invoiceNumber: string
    customerId: string
    customerName: string
    from: string
    to: string
    page: string
    pageSize: string
}

type InvoicePage = {
    invoices: Invoice[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

type SearchInvoicesResponse = {
    data?: { searchInvoices: InvoicePage }
    errors?: { message: string }[]
}

type InvoiceSearchResult = {
    searchKey: string
    invoicePage: InvoicePage | null
    error: string | null
}

const searchInvoicesQuery = `
    query SearchInvoices(
        $invoiceNumber: String
        $customerId: String
        $customerName: String
        $issuedFrom: Time
        $issuedTo: Time
        $page: Int
        $pageSize: Int
    ) {
        searchInvoices(
            invoiceNumber: $invoiceNumber
            customerId: $customerId
            customerName: $customerName
            issuedFrom: $issuedFrom
            issuedTo: $issuedTo
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

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:8080/graphql'
const emptyInvoices: Invoice[] = []
const invoiceGridColumns = '1fr minmax(0, 2.4fr) 0.8fr 1fr 1fr 1fr'

const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
})

function searchFormFromParams(searchParams: URLSearchParams): SearchForm {
    return {
        invoiceNumber: searchParams.get('invoiceNumber') ?? '',
        customerId: searchParams.get('customerId') ?? '',
        customerName: searchParams.get('customerName') ?? '',
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        page: searchParams.get('page') ?? '1',
        pageSize: searchParams.get('pageSize') ?? '20',
    }
}

function optionalFilter(value: string): string | null {
    const trimmedValue = value.trim()
    return trimmedValue === '' ? null : trimmedValue
}

function optionalDate(value: string): string | null {
    return value === '' ? null : `${value}T00:00:00.000Z`
}

function positiveInteger(value: string, fallback: number): number {
    const parsedValue = Number.parseInt(value, 10)
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

function formatDate(value: string | null): string {
    return value ? dateFormatter.format(new Date(value)) : '—'
}

function InvoiceSearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeSearch = useMemo(() => searchFormFromParams(searchParams), [searchParams])
    const searchKey = searchParams.toString()
    const [searchResult, setSearchResult] = useState<InvoiceSearchResult>({
        searchKey: '__initial__',
        invoicePage: null,
        error: null,
    })
    const isLoading = searchResult.searchKey !== searchKey
    const invoicePage = isLoading ? null : searchResult.invoicePage
    const invoices = invoicePage?.invoices ?? emptyInvoices
    const error = isLoading ? null : searchResult.error
    const firstInvoice = invoicePage && invoicePage.totalCount > 0
        ? (invoicePage.page - 1) * invoicePage.pageSize + 1
        : 0
    const lastInvoice = invoicePage
        ? Math.min(invoicePage.page * invoicePage.pageSize, invoicePage.totalCount)
        : 0

    useEffect(() => {
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: searchInvoicesQuery,
                variables: {
                    invoiceNumber: optionalFilter(activeSearch.invoiceNumber),
                    customerId: optionalFilter(activeSearch.customerId),
                    customerName: optionalFilter(activeSearch.customerName),
                    issuedFrom: optionalDate(activeSearch.from),
                    issuedTo: optionalDate(activeSearch.to),
                    page: positiveInteger(activeSearch.page, 1),
                    pageSize: Math.min(positiveInteger(activeSearch.pageSize, 20), 100),
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
                    error: requestError instanceof Error ? requestError.message : 'Invoice search failed',
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

        return [
            { label: 'Total amount', amount: total },
            {
                label: 'Unpaid',
                amount: unpaidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            },
            {
                label: 'Past due',
                amount: pastDueInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            },
            {
                label: 'Paid',
                amount: paidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
            },
        ]
    }, [invoices])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setSearchParams({
            invoiceNumber: String(formData.get('invoiceNumber') ?? '').trim(),
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            from: String(formData.get('from') ?? ''),
            to: String(formData.get('to') ?? ''),
            page: '1',
            pageSize: activeSearch.pageSize,
        })
    }

    function clearSearch() {
        setSearchParams({})
    }

    function changePage(page: number) {
        const nextSearchParams = new URLSearchParams(searchParams)
        nextSearchParams.set('page', String(page))
        nextSearchParams.set('pageSize', String(invoicePage?.pageSize ?? 20))
        setSearchParams(nextSearchParams)
    }

    return (
        <section>
            <nav aria-label="Breadcrumb" className="text-sm font-medium text-zinc-500">
                <span className="text-zinc-700">Invoices</span>
            </nav>

            <form
                key={searchParams.toString()}
                className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                onSubmit={submitSearch}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2 md:w-[calc(50%-0.625rem)]">
                        Invoice number
                        <input
                            type="search"
                            name="invoiceNumber"
                            defaultValue={activeSearch.invoiceNumber}
                            placeholder="e.g. 123"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Customer ID
                        <input
                            type="search"
                            name="customerId"
                            defaultValue={activeSearch.customerId}
                            placeholder="e.g. C-1001"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Customer
                        <input
                            type="search"
                            name="customerName"
                            defaultValue={activeSearch.customerName}
                            placeholder="Customer name"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Invoice date from
                        <input
                            type="date"
                            name="from"
                            defaultValue={activeSearch.from}
                            max={activeSearch.to || undefined}
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Invoice date to
                        <input
                            type="date"
                            name="to"
                            defaultValue={activeSearch.to}
                            min={activeSearch.from || undefined}
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-5">
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                        Search
                    </button>
                </div>
            </form>

            {invoicePage && (
                <div className="mt-3 flex items-center justify-end gap-2 text-sm text-zinc-600">
                    <span className="mr-2 tabular-nums">
                        {firstInvoice}–{lastInvoice} of {invoicePage.totalCount}
                    </span>
                    <button
                        type="button"
                        disabled={invoicePage.page <= 1}
                        onClick={() => changePage(invoicePage.page - 1)}
                        aria-label="Previous page"
                        title="Previous page"
                        className="grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
                    >
                        <span aria-hidden="true">&lt;</span>
                    </button>
                    <button
                        type="button"
                        disabled={invoicePage.page >= invoicePage.totalPages}
                        onClick={() => changePage(invoicePage.page + 1)}
                        aria-label="Next page"
                        title="Next page"
                        className="grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-transparent"
                    >
                        <span aria-hidden="true">&gt;</span>
                    </button>
                </div>
            )}

            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="min-w-225">
                    <div
                        className="grid gap-4 border-b border-zinc-200 bg-zinc-50 px-3 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase"
                        style={{ gridTemplateColumns: invoiceGridColumns }}
                    >
                        <span>Invoice number</span>
                        <span>Customer</span>
                        <span>Amount</span>
                        <span>Invoice date</span>
                        <span>Due date</span>
                        <span>Payment date</span>
                    </div>

                    {isLoading && <p className="px-3 py-6 text-sm text-zinc-500">Loading invoices…</p>}
                    {error && <p className="px-3 py-6 text-sm text-red-700">{error}</p>}
                    {!isLoading && !error && invoices.length === 0 && (
                        <p className="px-3 py-6 text-sm text-zinc-500">No invoices found.</p>
                    )}
                    {!isLoading && !error && invoices.map((invoice) => (
                        <Link
                            key={invoice.invoiceNumber}
                            to={`/invoice/${invoice.invoiceNumber}`}
                            className="grid gap-4 border-b border-zinc-100 px-3 py-4 text-sm transition last:border-b-0 hover:bg-zinc-50"
                            style={{ gridTemplateColumns: invoiceGridColumns }}
                        >
                            <span className="font-semibold text-zinc-950">{invoice.invoiceNumber}</span>
                            <span
                                className="min-w-0"
                                style={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                title={invoice.customerName ?? invoice.customerCode ?? '—'}
                            >
                                {invoice.customerName ?? invoice.customerCode ?? '—'}
                            </span>
                            <span className="font-medium">{currencyFormatter.format(invoice.amount ?? 0)}</span>
                            <span className="text-zinc-600">{formatDate(invoice.issueDate)}</span>
                            <span className="text-zinc-600">{formatDate(invoice.dueDate)}</span>
                            <span className="text-zinc-600">{formatDate(invoice.paymentDate)}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:w-[calc(50%-0.625rem)]">
                {summary.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 border-b border-zinc-200 p-3 last:border-b-0"
                    >
                        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{item.label}</p>
                        <p className="text-base font-semibold text-zinc-950">{currencyFormatter.format(item.amount)}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default InvoiceSearchPage
