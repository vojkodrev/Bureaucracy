import SearchResultCell from '@/components/SearchResultCell'
import { Fragment } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/formatters'
import { ComponentMode } from '@/lib/component-mode'
import type { GoodsReceipt } from '@/lib/goods-receipt-types'

type Props = {
    receipt: GoodsReceipt
    mode: ComponentMode
    onGoodsReceiptSelect?: (receipt: GoodsReceipt) => void
}

export default function GoodsReceiptSearchResultGroup({
    receipt,
    mode,
    onGoodsReceiptSelect,
}: Props) {
    const isPageMode = mode === ComponentMode.Page
    return (
        <Fragment>
            <TableRow
                className="cursor-pointer bg-muted/60 font-semibold"
                tabIndex={isPageMode ? undefined : 0}
                onClick={isPageMode ? undefined : () => onGoodsReceiptSelect?.(receipt)}
                onKeyDown={isPageMode ? undefined : (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onGoodsReceiptSelect?.(receipt)
                    }
                }}
            >
                <SearchResultCell
                    primary
                    to={isPageMode ? `/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}` : undefined}
                    linkLabel={`Open goods receipt ${receipt.receiptNumber}`}
                >
                    Goods receipt {receipt.receiptNumber || '—'}
                </SearchResultCell>
                <SearchResultCell
                    to={isPageMode ? `/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}` : undefined}
                    linkLabel={`Open goods receipt ${receipt.receiptNumber}`}
                >{formatDate(receipt.receiptDate)}</SearchResultCell>
                <SearchResultCell
                    to={isPageMode ? `/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}` : undefined}
                    linkLabel={`Open goods receipt ${receipt.receiptNumber}`}
                >{receipt.receivedBy || '—'}</SearchResultCell>
                <SearchResultCell to={isPageMode ? `/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}` : undefined} linkLabel={`Open goods receipt ${receipt.receiptNumber}`} />
            </TableRow>
            {receipt.items.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productCode || '—'}</TableCell>
                    <TableCell colSpan={2}>{item.productName || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">
                        {item.quantity == null ? '—' : item.quantity.toLocaleString('en-IE')}
                        {item.unit ? ` ${item.unit}` : ''}
                    </TableCell>
                </TableRow>
            ))}
        </Fragment>
    )
}
