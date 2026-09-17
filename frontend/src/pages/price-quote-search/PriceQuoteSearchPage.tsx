import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { defaultPageSize } from '@/lib/pagination'
import { fetchPriceQuotes } from './price-quote-search-api'
import {
    priceQuoteSearchFromParams,
    priceQuoteSearchToParams,
} from './price-quote-search-params'
import PriceQuoteSearchForm from './PriceQuoteSearchForm'
import PriceQuoteSearchResults from './PriceQuoteSearchResults'
import type {
    PriceQuotePage,
    PriceQuoteSearchCriteria,
    PriceQuoteSortColumn,
} from './types'

export default function PriceQuoteSearchPage() {
    const [params, setParams] = useSearchParams()
    const search = useMemo(
        () => priceQuoteSearchFromParams(params),
        [params],
    )
    const searchKey = useMemo(() => params.toString(), [params])
    const [result, setResult] = useState<PriceQuotePage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        setError(null)
        void fetchPriceQuotes(search, controller.signal)
            .then(setResult)
            .catch((reason: unknown) => {
                if (!controller.signal.aborted) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : 'Price quote search failed',
                    )
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false)
            })
        return () => controller.abort()
    }, [search, searchKey])

    function update(nextSearch: PriceQuoteSearchCriteria) {
        setParams(priceQuoteSearchToParams(nextSearch))
    }

    function sort(sortBy: PriceQuoteSortColumn) {
        const direction = search.sortBy !== sortBy
            ? 'asc'
            : search.sortDirection === 'asc'
                ? 'desc'
                : ''
        update({
            ...search,
            page: '1',
            sortBy: direction ? sortBy : '',
            sortDirection: direction,
        })
    }

    return (
        <div className="p-4">
            {error && (
                <Alert variant="destructive" className="mb-4 max-w-6xl">
                    <AlertTitle>Price quote search failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <PriceQuoteSearchForm
                key={searchKey}
                search={search}
                onSubmit={update}
                onReset={() => setParams({})}
            />
            {!error && (
                <PriceQuoteSearchResults
                    result={result}
                    loading={loading}
                    search={search}
                    onPageChange={(page) => update({
                        ...search,
                        page: String(page),
                        pageSize: String(
                            result?.pageSize ?? defaultPageSize,
                        ),
                    })}
                    onPageSizeChange={(pageSize) => update({
                        ...search,
                        page: '1',
                        pageSize: String(pageSize),
                    })}
                    onSort={sort}
                />
            )}
        </div>
    )
}
