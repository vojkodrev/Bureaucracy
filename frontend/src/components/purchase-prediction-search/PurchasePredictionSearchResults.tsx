import { Fragment } from 'react'
import Pager from '@/components/Pager'
import SearchResultCell from '@/components/SearchResultCell'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type {
    PurchasePrediction,
    PurchasePredictionPage,
} from '@/lib/purchase-prediction-types'

const percentage = new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
})

type Props = {
    result: PurchasePredictionPage | null
    isLoading: boolean
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export default function PurchasePredictionSearchResults({
    result,
    isLoading,
    onPageChange,
    onPageSizeChange,
}: Props) {
    const groups = new Map<string, PurchasePrediction[]>()
    for (const prediction of result?.predictions ?? []) {
        const customerPredictions = groups.get(prediction.customerCode) ?? []
        groups.set(
            prediction.customerCode,
            [...customerPredictions, prediction],
        )
    }
    const first = result && result.totalCount
        ? (result.page - 1) * result.pageSize + 1
        : 0
    const last = result
        ? Math.min(result.page * result.pageSize, result.totalCount)
        : 0

    return (
        <div className="mt-8 w-full overflow-x-auto">
            {result && (
                <Pager
                    firstItem={first}
                    lastItem={last}
                    page={result.page}
                    pageSize={result.pageSize}
                    totalItems={result.totalCount}
                    totalPages={result.totalPages}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
            <Table aria-busy={isLoading}>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product code</TableHead>
                        <TableHead>Product name</TableHead>
                        <TableHead className="text-right">7 days</TableHead>
                        <TableHead className="text-right">14 days</TableHead>
                        <TableHead className="text-right">30 days</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && groups.size === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Loading purchase predictions…
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && groups.size === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No purchase predictions found.
                            </TableCell>
                        </TableRow>
                    )}
                    {[...groups.values()].map((predictions) => {
                        const customer = predictions[0]
                        const customerPath = `/customer/${encodeURIComponent(
                            customer.customerCode,
                        )}`
                        return (
                            <Fragment key={customer.customerCode}>
                                <TableRow className="cursor-pointer bg-muted/60">
                                    <SearchResultCell
                                        primary
                                        to={customerPath}
                                        linkLabel={
                                            `Open customer ${customer.customerCode}`
                                        }
                                        colSpan={5}
                                        className="font-semibold"
                                    >
                                        {customer.customerCode}
                                        {customer.customerName
                                            ? ` — ${customer.customerName}`
                                            : ''}
                                    </SearchResultCell>
                                </TableRow>
                                {predictions.map((prediction) => (
                                    <PredictionRow
                                        key={prediction.id}
                                        prediction={prediction}
                                    />
                                ))}
                            </Fragment>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

function PredictionRow({ prediction }: { prediction: PurchasePrediction }) {
    const productPath = `/product/${encodeURIComponent(
        prediction.productCode,
    )}`
    const label = `Open product ${prediction.productCode}`
    const scores = [
        prediction.score7Days,
        prediction.score14Days,
        prediction.score30Days,
    ]

    return (
        <TableRow className="cursor-pointer">
            <SearchResultCell primary to={productPath} linkLabel={label}>
                {prediction.productCode}
            </SearchResultCell>
            <SearchResultCell to={productPath} linkLabel={label}>
                {prediction.productName || '—'}
            </SearchResultCell>
            {scores.map((score, index) => (
                <SearchResultCell
                    key={index}
                    to={productPath}
                    linkLabel={label}
                    className="text-right tabular-nums"
                >
                    {percentage.format(score)}
                </SearchResultCell>
            ))}
        </TableRow>
    )
}
