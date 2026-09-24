import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import BankStatementSearchErrors from '@/components/bank-statement-search/BankStatementSearchErrors'
import BankStatementSearchForm from '@/components/bank-statement-search/BankStatementSearchForm'
import BankStatementSearchResults from '@/components/bank-statement-search/BankStatementSearchResults'
import type { BankStatementSearchCriteria } from '@/components/bank-statement-search/types'
import type { BankStatementEntry, BankStatementPage } from '@/lib/bank-statement-types'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateFromSearchValue, optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'

type SearchForm = BankStatementSearchCriteria

type SearchBankStatementsResponse = {
    data?: { searchBankStatements: BankStatementPage }
    errors?: { message: string }[]
}

const searchBankStatementsQuery = `
    query SearchBankStatements(
        $businessYear: String!
        $dateFrom: Time
        $dateTo: Time
        $statementNumber: Int
        $documentNumber: String
        $bankAccount: String
        $customerId: String
        $customerName: String
        $sortBy: String
        $sortDirection: String
        $page: Int
        $pageSize: Int
    ) {
        searchBankStatements(
            businessYear: $businessYear
            dateFrom: $dateFrom
            dateTo: $dateTo
            statementNumber: $statementNumber
            documentNumber: $documentNumber
            bankAccount: $bankAccount
            customerId: $customerId
            customerName: $customerName
            sortBy: $sortBy
            sortDirection: $sortDirection
            page: $page
            pageSize: $pageSize
        ) {
            entries {
                id statementId statementNumber paymentDate customerId customerName
                transactionType transactionTypeId outflow inflow documentNumber
            }
            totalCount page pageSize totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function searchFormFromParams(params: URLSearchParams): SearchForm {
    return {
        from: params.get('from') ?? '',
        to: params.get('to') ?? '',
        statementNumber: params.get('statementNumber') ?? '',
        documentNumber: params.get('documentNumber') ?? '',
        bankAccount: params.get('bankAccount') ?? '',
        customerId: params.get('customerId') ?? '',
        customerName: params.get('customerName') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
        sortBy: params.get('sortBy') === 'date' ? 'date' : '',
        sortDirection: params.get('sortBy') === 'date'
            && (params.get('sortDirection') === 'asc' || params.get('sortDirection') === 'desc')
            ? params.get('sortDirection') as 'asc' | 'desc'
            : '',
    }
}

function searchParamsFromForm(search: SearchForm): URLSearchParams {
    const params = new URLSearchParams()
    for (const key of ['from', 'to', 'statementNumber', 'documentNumber', 'bankAccount', 'customerId', 'customerName'] as const) {
        if (search[key]) params.set(key, search[key])
    }
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
    if (search.sortBy && search.sortDirection) {
        params.set('sortBy', search.sortBy)
        params.set('sortDirection', search.sortDirection)
    }
    return params
}

function optionalStatementNumber(value: string): number | null {
    if (!value) return null
    const number = Number(value)
    return Number.isInteger(number) ? number : null
}

function BankStatementSearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const search = useMemo(() => searchFormFromParams(searchParams), [searchParams])
    const searchKey = useMemo(() => new URLSearchParams(search).toString(), [search])
    const [customerId, setCustomerId] = useState(search.customerId)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [bankAccount, setBankAccount] = useState(search.bankAccount)
    const [dateFrom, setDateFrom] = useState(() => dateFromSearchValue(search.from))
    const [dateTo, setDateTo] = useState(() => dateFromSearchValue(search.to))
    const [result, setResult] = useState<{
        searchKey: string
        page: BankStatementPage | null
        error: string | null
    }>({ searchKey: '__initial__', page: null, error: null })

    const isLoading = result.searchKey !== searchKey
    const statementPage = isLoading ? null : result.page
    const error = isLoading ? null : result.error
    const groups = useMemo(() => {
        const grouped = new Map<number, BankStatementEntry[]>()
        for (const entry of statementPage?.entries ?? []) {
            const entries = grouped.get(entry.statementId) ?? []
            entries.push(entry)
            grouped.set(entry.statementId, entries)
        }
        return [...grouped.values()]
    }, [statementPage])

    useEffect(() => {
        setCustomerId(search.customerId)
        setCustomerName(search.customerName)
        setBankAccount(search.bankAccount)
        setDateFrom(dateFromSearchValue(search.from))
        setDateTo(dateFromSearchValue(search.to))
    }, [search.bankAccount, search.customerId, search.customerName, search.from, search.to])

    useEffect(() => {
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: searchBankStatementsQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    dateFrom: optionalDate(search.from),
                    dateTo: optionalDate(search.to),
                    statementNumber: optionalStatementNumber(search.statementNumber),
                    documentNumber: optionalFilter(search.documentNumber),
                    bankAccount: optionalFilter(search.bankAccount),
                    customerId: optionalFilter(search.customerId),
                    customerName: optionalFilter(search.customerName),
                    sortBy: search.sortBy || null,
                    sortDirection: search.sortDirection || null,
                    page: positiveInteger(search.page, defaultPage),
                    pageSize: Math.min(positiveInteger(search.pageSize, defaultPageSize), maximumPageSize),
                },
            }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Bank statement search failed (${response.status})`)
            const responseResult = (await response.json()) as SearchBankStatementsResponse
            if (responseResult.errors?.length) {
                throw new Error(responseResult.errors.map(({ message }) => message).join(', '))
            }
            setResult({ searchKey, page: responseResult.data?.searchBankStatements ?? null, error: null })
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setResult({
                searchKey,
                page: null,
                error: requestError instanceof Error ? requestError.message : 'Bank statement search failed',
            })
        })
        return () => abortController.abort()
    }, [search, searchKey])

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        setSearchParams(searchParamsFromForm({
            from: String(formData.get('from') ?? ''),
            to: String(formData.get('to') ?? ''),
            statementNumber: String(formData.get('statementNumber') ?? '').trim(),
            documentNumber: String(formData.get('documentNumber') ?? '').trim(),
            bankAccount,
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: search.pageSize,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
        }))
    }

    function clearSearch() {
        setCustomerId('')
        setCustomerName('')
        setBankAccount('')
        setDateFrom(undefined)
        setDateTo(undefined)
        setSearchParams({})
    }

    function changePage(page: number) {
        setSearchParams(searchParamsFromForm({
            ...search,
            page: String(page),
            pageSize: String(statementPage?.pageSize ?? defaultPageSize),
        }))
    }

    function changePageSize(pageSize: number) {
        setSearchParams(searchParamsFromForm({
            ...search,
            page: String(defaultPage),
            pageSize: String(pageSize),
        }))
    }

    function changeSort() {
        const sortDirection = search.sortBy !== 'date'
            ? 'asc'
            : search.sortDirection === 'asc'
                ? 'desc'
                : ''
        setSearchParams(searchParamsFromForm({
            ...search,
            page: String(defaultPage),
            sortBy: sortDirection ? 'date' : '',
            sortDirection,
        }))
    }

    return (
        <div className="p-4">
            <BankStatementSearchErrors error={error} />
            <BankStatementSearchForm
                key={searchKey}
                search={search}
                bankAccount={bankAccount}
                customerId={customerId}
                customerName={customerName}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onBankAccountChange={setBankAccount}
                onCustomerIdChange={setCustomerId}
                onCustomerNameChange={setCustomerName}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onSubmit={submitSearch}
                onReset={clearSearch}
            />
            {!error && (
                <BankStatementSearchResults
                    statementPage={statementPage}
                    groups={groups}
                    isLoading={isLoading}
                    search={search}
                    onPageChange={changePage}
                    onPageSizeChange={changePageSize}
                    onSort={changeSort}
                />
            )}
        </div>
    )
}

export default BankStatementSearchPage
