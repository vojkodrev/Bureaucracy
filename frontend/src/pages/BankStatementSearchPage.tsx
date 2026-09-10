import { Fragment, useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import BankAccountComboboxField from '@/components/BankAccountComboboxField'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
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
import type { BankStatementEntry, BankStatementPage } from '@/lib/bank-statement-types'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateFromSearchValue, optionalDate } from '@/lib/dates'
import { optionalFilter } from '@/lib/filters'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { defaultPage, defaultPageSize, maximumPageSize, positiveInteger } from '@/lib/pagination'

type SearchForm = {
    from: string
    to: string
    statementNumber: string
    bankAccount: string
    customerId: string
    customerName: string
    page: string
    pageSize: string
}

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
        $bankAccount: String
        $customerId: String
        $customerName: String
        $page: Int
        $pageSize: Int
    ) {
        searchBankStatements(
            businessYear: $businessYear
            dateFrom: $dateFrom
            dateTo: $dateTo
            statementNumber: $statementNumber
            bankAccount: $bankAccount
            customerId: $customerId
            customerName: $customerName
            page: $page
            pageSize: $pageSize
        ) {
            entries {
                id statementId statementNumber paymentDate customerId customerName
                transactionType outflow inflow invoiceNumber
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
        bankAccount: params.get('bankAccount') ?? '',
        customerId: params.get('customerId') ?? '',
        customerName: params.get('customerName') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
    }
}

function searchParamsFromForm(search: SearchForm): URLSearchParams {
    const params = new URLSearchParams()
    for (const key of ['from', 'to', 'statementNumber', 'bankAccount', 'customerId', 'customerName'] as const) {
        if (search[key]) params.set(key, search[key])
    }
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
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
                    bankAccount: optionalFilter(search.bankAccount),
                    customerId: optionalFilter(search.customerId),
                    customerName: optionalFilter(search.customerName),
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
            bankAccount,
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: search.pageSize,
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

    const firstStatement = statementPage && statementPage.totalCount > 0
        ? (statementPage.page - 1) * statementPage.pageSize + 1
        : 0
    const lastStatement = statementPage
        ? Math.min(statementPage.page * statementPage.pageSize, statementPage.totalCount)
        : 0

    return (
        <div className="p-4">
            <form key={searchKey} className="max-w-4xl" onSubmit={submitSearch} onReset={clearSearch}>
                <Card>
                    <CardContent>
                        <FieldGroup>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="statement-number">Statement number</FieldLabel>
                                    <Input id="statement-number" type="number" min="0" name="statementNumber" defaultValue={search.statementNumber} />
                                </Field>
                                <BankAccountComboboxField id="bank-account" label="Bank account" value={bankAccount} onChange={setBankAccount} />
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <DatePickerField id="statement-date-from" label="Payment date from" name="from" date={dateFrom} onSelect={setDateFrom} />
                                <DatePickerField id="statement-date-to" label="Payment date to" name="to" date={dateTo} onSelect={setDateTo} />
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <CustomerPickerField id="statement-customer-id" label="Customer number" name="customerId" customerId={customerId} onCustomerIdChange={setCustomerId} onCustomerNameChange={setCustomerName} />
                                <Field>
                                    <FieldLabel htmlFor="statement-customer-name">Customer name</FieldLabel>
                                    <Input id="statement-customer-name" type="search" name="customerName" value={customerName} autoComplete="off" onChange={(event) => setCustomerName(event.target.value)} />
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

            <div className="mt-8 w-full overflow-x-auto">
                {statementPage && (
                    <Pager firstItem={firstStatement} lastItem={lastStatement} page={statementPage.page} totalItems={statementPage.totalCount} totalPages={statementPage.totalPages} onPageChange={changePage} />
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Payment date</TableHead>
                            <TableHead>Customer name</TableHead>
                            <TableHead>Transaction type</TableHead>
                            <TableHead className="text-right">Outflow</TableHead>
                            <TableHead className="text-right">Inflow</TableHead>
                            <TableHead>Invoice number</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading bank statements…</TableCell></TableRow>}
                        {error && <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">{error}</TableCell></TableRow>}
                        {!isLoading && !error && groups.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No bank statements found.</TableCell></TableRow>}
                        {!isLoading && !error && groups.map((entries) => {
                            const statement = entries[0]
                            const netMovement = entries.reduce((sum, entry) => sum + (entry.inflow ?? 0) - (entry.outflow ?? 0), 0)
                            return (
                                <Fragment key={statement.statementId}>
                                    <TableRow className="bg-muted/60">
                                        <TableCell colSpan={6} className="font-semibold">Statement {statement.statementNumber ?? '—'}</TableCell>
                                    </TableRow>
                                    {entries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{formatDate(entry.paymentDate)}</TableCell>
                                            <TableCell>{entry.customerName || '—'}</TableCell>
                                            <TableCell>{entry.transactionType || '—'}</TableCell>
                                            <TableCell className="text-right tabular-nums">{entry.outflow == null ? '—' : formatCurrency(entry.outflow)}</TableCell>
                                            <TableCell className="text-right tabular-nums">{entry.inflow == null ? '—' : formatCurrency(entry.inflow)}</TableCell>
                                            <TableCell>{entry.invoiceNumber || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="border-b-2 font-medium">
                                        <TableCell colSpan={3} className="text-right">Net movement</TableCell>
                                        <TableCell colSpan={3} className="text-right tabular-nums">{formatCurrency(netMovement)}</TableCell>
                                    </TableRow>
                                </Fragment>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default BankStatementSearchPage
