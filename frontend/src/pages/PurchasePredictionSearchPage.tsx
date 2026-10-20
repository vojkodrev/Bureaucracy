import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import {
    fetchPurchasePredictions,
    purchasePredictionReportPdfUrl,
    PurchasePredictionSearchForm,
    PurchasePredictionSearchResults,
    type PurchasePredictionSearchCriteria,
} from '@/components/purchase-prediction-search'
import PurchasePredictionSearchMenu from '@/components/purchase-prediction-search/PurchasePredictionSearchMenu'
import { isStorageOnlyUser, openAuthenticatedUrl } from '@/lib/auth'
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
    const [printError, setPrintError] = useState<string | null>(null)
    const isLoading = state.key !== searchKey
    const canPrint = !isLoading && !state.error
        && Boolean(state.result?.predictions.length)

    const printReport = async () => {
        if (!canPrint) return
        try {
            await openAuthenticatedUrl(purchasePredictionReportPdfUrl(search))
            setPrintError(null)
        } catch (error) {
            setPrintError(error instanceof Error
                ? error.message
                : 'Could not open the purchase prediction report PDF.')
        }
    }
    const onPrintShortcut = useEffectEvent(printReport)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey)
                || event.key.toLowerCase() !== 'p') return
            event.preventDefault()
            onPrintShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

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
            {printError && (
                <div className="mb-6 max-w-4xl">
                    <ErrorAlert
                        title="Purchase prediction report could not be printed"
                        description="The report PDF could not be opened."
                        error={printError}
                    />
                </div>
            )}
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
            <PurchasePredictionSearchMenu
                disabled={!canPrint}
                onPrint={printReport}
            />
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
                    allowCustomerNavigation={!isStorageOnlyUser()}
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
