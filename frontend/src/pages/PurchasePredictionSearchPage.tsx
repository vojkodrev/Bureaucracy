import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import {
    fetchPurchasePredictions,
    PurchasePredictionSearchForm,
    PurchasePredictionSearchResults,
    type PurchasePredictionSearchCriteria,
} from '@/components/purchase-prediction-search'
import { defaultPage, defaultPageSize } from '@/lib/pagination'
import type { PurchasePredictionPage } from '@/lib/purchase-prediction-types'

type SearchState = {
    key: string
    result: PurchasePredictionPage | null
    error: string | null
}

function fromParams(
    params: URLSearchParams,
): PurchasePredictionSearchCriteria {
    return {
        customerCode: params.get('customerCode') ?? '',
        customerName: params.get('customerName') ?? '',
        productCode: params.get('productCode') ?? '',
        productName: params.get('productName') ?? '',
        page: params.get('page') ?? String(defaultPage),
        pageSize: params.get('pageSize') ?? String(defaultPageSize),
    }
}

function toParams(search: PurchasePredictionSearchCriteria) {
    const params = new URLSearchParams()
    const filters = [
        'customerCode',
        'customerName',
        'productCode',
        'productName',
    ] as const
    for (const key of filters) {
        if (search[key]) params.set(key, search[key])
    }
    params.set('page', search.page)
    params.set('pageSize', search.pageSize)
    return params
}

export default function PurchasePredictionSearchPage() {
    const [params, setParams] = useSearchParams()
    const search = useMemo(() => fromParams(params), [params])
    const searchKey = useMemo(
        () => new URLSearchParams(search).toString(),
        [search],
    )
    const [state, setState] = useState<SearchState>({
        key: '',
        result: null,
        error: null,
    })
    const isLoading = state.key !== searchKey

    useEffect(() => {
        const controller = new AbortController()
        void fetchPurchasePredictions(search, controller.signal)
            .then((result) => {
                setState({ key: searchKey, result, error: null })
            })
            .catch((error: unknown) => {
                if (
                    error instanceof DOMException
                    && error.name === 'AbortError'
                ) return
                setState({
                    key: searchKey,
                    result: null,
                    error: error instanceof Error
                        ? error.message
                        : 'Purchase prediction search failed',
                })
            })
        return () => controller.abort()
    }, [search, searchKey])

    function update(next: PurchasePredictionSearchCriteria) {
        setParams(toParams(next))
    }

    return (
        <div className="p-4">
            {!isLoading && state.error && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Purchase predictions could not be loaded"
                        description={
                            'The purchase prediction search could not be completed.'
                        }
                        error={state.error}
                    />
                </div>
            )}
            <PurchasePredictionSearchForm
                key={searchKey}
                search={search}
                onSubmit={update}
                onReset={() => setParams({})}
            />
            {!state.error && (
                <PurchasePredictionSearchResults
                    result={state.result}
                    isLoading={isLoading}
                    onPageChange={(page) => update({
                        ...search,
                        page: String(page),
                        pageSize: String(
                            state.result?.pageSize ?? defaultPageSize,
                        ),
                    })}
                    onPageSizeChange={(pageSize) => update({
                        ...search,
                        page: String(defaultPage),
                        pageSize: String(pageSize),
                    })}
                />
            )}
        </div>
    )
}
