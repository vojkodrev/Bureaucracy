import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { defaultPageSize } from '@/lib/pagination'
import { fetchDeliveryNotes } from './delivery-note-search-api'
import {
    deliveryNoteSearchFromParams,
    deliveryNoteSearchToParams,
} from './delivery-note-search-params'
import DeliveryNoteSearchForm from './DeliveryNoteSearchForm'
import DeliveryNoteSearchResults from './DeliveryNoteSearchResults'
import type {
    DeliveryNotePage,
    DeliveryNoteSearchCriteria,
    DeliveryNoteSortColumn,
} from './types'

export default function DeliveryNoteSearchPage() {
    const [params, setParams] = useSearchParams()
    const search = useMemo(
        () => deliveryNoteSearchFromParams(params),
        [params],
    )
    const searchKey = useMemo(() => params.toString(), [params])
    const [result, setResult] = useState<DeliveryNotePage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        setError(null)
        void fetchDeliveryNotes(search, controller.signal)
            .then(setResult)
            .catch((reason: unknown) => {
                if (!controller.signal.aborted) {
                    setError(reason instanceof Error
                        ? reason.message
                        : 'Delivery note search failed')
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false)
            })
        return () => controller.abort()
    }, [search, searchKey])

    function update(nextSearch: DeliveryNoteSearchCriteria) {
        setParams(deliveryNoteSearchToParams(nextSearch))
    }

    function sort(sortBy: DeliveryNoteSortColumn) {
        const direction = search.sortBy !== sortBy
            ? 'asc'
            : search.sortDirection === 'asc' ? 'desc' : ''
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
                    <AlertTitle>Delivery note search failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <DeliveryNoteSearchForm
                key={searchKey}
                search={search}
                onSubmit={update}
                onReset={() => setParams({})}
            />
            {!error && (
                <DeliveryNoteSearchResults
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
