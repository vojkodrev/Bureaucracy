import { Fragment } from 'react'
import { Link } from 'react-router-dom'
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
                className="relative cursor-pointer bg-muted/60 font-semibold"
                tabIndex={isPageMode ? undefined : 0}
                onClick={isPageMode ? undefined : () => onGoodsReceiptSelect?.(receipt)}
                onKeyDown={isPageMode ? undefined : (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onGoodsReceiptSelect?.(receipt)
                    }
                }}
            >
                <TableCell>
                    {isPageMode && (
                        <Link
                            to={`/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}`}
                            aria-label={`Open goods receipt ${receipt.receiptNumber}`}
                            className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                        />
                    )}
                    Goods receipt {receipt.receiptNumber || '—'}
                </TableCell>
                <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                <TableCell>{receipt.receivedBy || '—'}</TableCell>
                <TableCell />
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
