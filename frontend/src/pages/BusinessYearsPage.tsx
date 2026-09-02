import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pager from '@/components/Pager'
import {
    getSelectedBusinessYear,
    setSelectedBusinessYear,
} from '@/lib/business-year'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

type BusinessYear = {
    code: string | null
    description: string | null
    year: number | null
    derivedFrom: string | null
}

type BusinessYearPage = {
    businessYears: BusinessYear[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

type BusinessYearsResponse = {
    data?: { businessYears: BusinessYearPage }
    errors?: { message: string }[]
}

type BusinessYearsResult = {
    requestKey: string
    businessYearPage: BusinessYearPage | null
    error: string | null
}

const businessYearsQuery = `
    query BusinessYears($page: Int, $pageSize: Int) {
        businessYears(page: $page, pageSize: $pageSize) {
            businessYears {
                code
                description
                year
                derivedFrom
            }
            totalCount
            page
            pageSize
            totalPages
        }
    }
`

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const defaultPage = 1
const defaultPageSize = 20
const maximumPageSize = 100

function positiveInteger(value: string | null, fallback: number): number {
    const parsedValue = Number.parseInt(value ?? '', 10)
    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback
}

function BusinessYearsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const requestKey = searchParams.toString()
    const requestedPage = positiveInteger(
        searchParams.get('page'),
        defaultPage,
    )
    const requestedPageSize = Math.min(
        positiveInteger(searchParams.get('pageSize'), defaultPageSize),
        maximumPageSize,
    )
    const [result, setResult] = useState<BusinessYearsResult>({
        requestKey: '__initial__',
        businessYearPage: null,
        error: null,
    })
    const [selectedBusinessYear, setSelectedBusinessYearState] =
        useState(getSelectedBusinessYear)
    const isLoading = result.requestKey !== requestKey
    const businessYearPage = isLoading ? null : result.businessYearPage
    const businessYears = businessYearPage?.businessYears ?? []
    const error = isLoading ? null : result.error
    const firstBusinessYear =
        businessYearPage && businessYearPage.totalCount > 0
            ? (businessYearPage.page - 1) * businessYearPage.pageSize + 1
            : 0
    const lastBusinessYear = businessYearPage
        ? Math.min(
              businessYearPage.page * businessYearPage.pageSize,
              businessYearPage.totalCount,
          )
        : 0

    useEffect(() => {
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: businessYearsQuery,
                variables: {
                    page: requestedPage,
                    pageSize: requestedPageSize,
                },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `Loading business years failed (${response.status})`,
                    )
                }

                const responseBody =
                    (await response.json()) as BusinessYearsResponse
                if (responseBody.errors?.length) {
                    throw new Error(
                        responseBody.errors
                            .map(({ message }) => message)
                            .join(', '),
                    )
                }

                setResult({
                    requestKey,
                    businessYearPage:
                        responseBody.data?.businessYears ?? null,
                    error: null,
                })
            })
            .catch((requestError: unknown) => {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === 'AbortError'
                ) {
                    return
                }

                setResult({
                    requestKey,
                    businessYearPage: null,
                    error:
                        requestError instanceof Error
                            ? requestError.message
                            : 'Loading business years failed',
                })
            })

        return () => abortController.abort()
    }, [requestKey, requestedPage, requestedPageSize])

    function changePage(page: number) {
        setSearchParams({
            page: String(page),
            pageSize: String(businessYearPage?.pageSize ?? defaultPageSize),
        })
    }

    function selectBusinessYear(businessYear: BusinessYear) {
        if (!businessYear.code) return

        setSelectedBusinessYear(businessYear.code)
        setSelectedBusinessYearState(businessYear.code)
    }

    return (
        <div className="p-4">
            <div className="mb-8 max-w-sm">
                <h2 className="mb-2 text-sm font-medium">Summary</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Selected business year</TableCell>
                            <TableCell className="font-medium">
                                {selectedBusinessYear}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {businessYearPage && (
                <Pager
                    firstItem={firstBusinessYear}
                    lastItem={lastBusinessYear}
                    page={businessYearPage.page}
                    totalItems={businessYearPage.totalCount}
                    totalPages={businessYearPage.totalPages}
                    onPageChange={changePage}
                />
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Business year</TableHead>
                        <TableHead>Derived from</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading business years…
                            </TableCell>
                        </TableRow>
                    )}
                    {error && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-destructive"
                            >
                                {error}
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && !error && businessYears.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No business years found.
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading &&
                        !error &&
                        businessYears.map((businessYear, index) => (
                            <TableRow
                                key={`${businessYear.code ?? 'business-year'}-${businessYear.year ?? index}`}
                                aria-selected={
                                    businessYear.code === selectedBusinessYear
                                }
                                className={
                                    businessYear.code
                                        ? 'cursor-pointer aria-selected:bg-muted'
                                        : undefined
                                }
                                tabIndex={businessYear.code ? 0 : undefined}
                                onClick={() => selectBusinessYear(businessYear)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault()
                                        selectBusinessYear(businessYear)
                                    }
                                }}
                            >
                                <TableCell className="font-medium">
                                    {businessYear.code ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {businessYear.description ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {businessYear.year ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {businessYear.derivedFrom ?? '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default BusinessYearsPage
