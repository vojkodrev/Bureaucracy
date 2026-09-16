import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import InvoiceSearchMenu from '@/pages/invoice/InvoiceSearchMenu'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { ComponentMode } from '@/lib/component-mode'
import { optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import type { Invoice, InvoicePage } from '@/lib/invoice-types'
import {
    defaultPage,
    defaultPageSize,
    maximumPageSize,
    positiveInteger,
} from '@/lib/pagination'
import InvoiceSearchErrors from './InvoiceSearchErrors'
import InvoiceSearchForm from './InvoiceSearchForm'
import InvoiceSearchResults from './InvoiceSearchResults'
import InvoiceSearchSummary from './InvoiceSearchSummary'
import type { InvoiceSearchCriteria, InvoiceSortColumn, PaymentStatus } from './types'
import { invoiceSortColumns, paymentStatuses } from './types'

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
        $productCode: String
        $productName: String
        $issuedFrom: Time
        $issuedTo: Time
        $paymentStatus: String
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
            productCode: $productCode
            productName: $productName
            issuedFrom: $issuedFrom
            issuedTo: $issuedTo
            paymentStatus: $paymentStatus
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

function invoiceReportPdfUrl(search: InvoiceSearchCriteria): string {
    const url = new URL(graphqlUrl)
    url.pathname = '/api/invoices/report/pdf'
    url.search = searchParamsFromForm(search).toString()
    url.searchParams.set('businessYear', getSelectedBusinessYear())
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

function searchFormFromParams(searchParams: URLSearchParams): InvoiceSearchCriteria {
    const sortByValue = searchParams.get('sortBy')
    const sortDirectionValue = searchParams.get('sortDirection')
    const paymentStatusValue = searchParams.get('paymentStatus')
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
        productCode: searchParams.get('productCode') ?? '',
        productName: searchParams.get('productName') ?? '',
        from: searchParams.get('from') ?? '',
        to: searchParams.get('to') ?? '',
        paymentStatus: paymentStatuses.includes(paymentStatusValue as PaymentStatus)
            ? paymentStatusValue as PaymentStatus
            : 'all',
        page: searchParams.get('page') ?? '1',
        pageSize: searchParams.get('pageSize') ?? String(defaultPageSize),
        sortBy: sortDirection ? sortBy : '',
        sortDirection: sortBy ? sortDirection : '',
    }
}

function searchParamsFromForm(search: InvoiceSearchCriteria): URLSearchParams {
    const searchParams = new URLSearchParams()

    for (const key of [
        'invoiceNumber', 'customerId', 'customerName', 'productCode', 'productName', 'from', 'to',
    ] as const) {
        if (search[key]) searchParams.set(key, search[key])
    }
    if (search.paymentStatus !== 'all') {
        searchParams.set('paymentStatus', search.paymentStatus)
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
    const pageSearch = useMemo(() => searchFormFromParams(searchParams), [searchParams])
    const [dialogSearch, setDialogSearch] = useState<InvoiceSearchCriteria>(() =>
        searchFormFromParams(new URLSearchParams()),
    )
    const activeSearch = mode === ComponentMode.Page ? pageSearch : dialogSearch
    const searchKey = useMemo(
        () => new URLSearchParams(activeSearch).toString(),
        [activeSearch],
    )
    const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)
    const [searchResult, setSearchResult] = useState<InvoiceSearchResult>({
        searchKey: '__initial__',
        invoicePage: null,
        error: null,
    })
    const [printError, setPrintError] = useState<string | null>(null)
    const isLoading = searchResult.searchKey !== searchKey
    const invoicePage = isLoading ? null : searchResult.invoicePage
    const invoices = invoicePage?.invoices ?? emptyInvoices
    const error = isLoading ? null : searchResult.error
    const canPrint = !isLoading && !error && invoices.length > 0

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
                    productCode: optionalFilter(activeSearch.productCode),
                    productName: optionalFilter(activeSearch.productName),
                    issuedFrom: optionalDate(activeSearch.from),
                    issuedTo: optionalDate(activeSearch.to),
                    paymentStatus: activeSearch.paymentStatus,
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
                if (!response.ok) throw new Error(`Invoice search failed (${response.status})`)
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
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setSearchResult({
                    searchKey,
                    invoicePage: null,
                    error: requestError instanceof Error
                        ? requestError.message
                        : 'Invoice search failed',
                })
            })

        return () => abortController.abort()
    }, [activeSearch, searchKey])

    function updateSearch(nextSearch: InvoiceSearchCriteria) {
        if (mode === ComponentMode.Page) {
            setSearchParams(searchParamsFromForm(nextSearch))
        } else {
            setDialogSearch(nextSearch)
        }
    }

    function clearSearch() {
        setSelectedInvoiceNumber(null)
        if (mode === ComponentMode.Page) {
            setSearchParams({})
        } else {
            setDialogSearch(searchFormFromParams(new URLSearchParams()))
        }
    }

    function changePage(page: number) {
        const pageSize = String(invoicePage?.pageSize ?? defaultPageSize)
        updateSearch({ ...activeSearch, page: String(page), pageSize })
    }

    function changePageSize(pageSize: number) {
        updateSearch({ ...activeSearch, page: '1', pageSize: String(pageSize) })
    }

    function changeSort(sortBy: InvoiceSortColumn) {
        const sortDirection = activeSearch.sortBy !== sortBy
            ? 'asc'
            : activeSearch.sortDirection === 'asc'
                ? 'desc'
                : ''
        updateSearch({
            ...activeSearch,
            page: '1',
            sortBy: sortDirection ? sortBy : '',
            sortDirection,
        })
    }

    function selectInvoice(invoice: Invoice) {
        setSelectedInvoiceNumber(invoice.invoiceNumber)
        onInvoiceSelect?.(invoice)
    }

    const printReport = () => {
        if (!canPrint) return
        const pdfTab = window.open(invoiceReportPdfUrl(activeSearch), '_blank')
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the invoice report PDF.')
            return
        }
        pdfTab.opener = null
        setPrintError(null)
    }
    const onPrintShortcut = useEffectEvent(printReport)

    useEffect(() => {
        if (mode !== ComponentMode.Page) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return
            event.preventDefault()
            onPrintShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [mode])

    return (
        <div className="p-4">
            <InvoiceSearchErrors printError={printError} searchError={error} />
            {mode === ComponentMode.Page && (
                <InvoiceSearchMenu disabled={!canPrint} onPrint={printReport} />
            )}
            <InvoiceSearchForm
                key={searchKey}
                search={activeSearch}
                onSubmit={updateSearch}
                onReset={clearSearch}
            />
            {!error && (
                <InvoiceSearchResults
                    invoicePage={invoicePage}
                    invoices={invoices}
                    isLoading={isLoading}
                    mode={mode}
                    search={activeSearch}
                    selectedInvoiceNumber={selectedInvoiceNumber}
                    onInvoiceSelect={selectInvoice}
                    onPageChange={changePage}
                    onPageSizeChange={changePageSize}
                    onSort={changeSort}
                />
            )}
            {!error && <InvoiceSearchSummary invoices={invoices} />}
        </div>
    )
}

export default InvoiceSearch
