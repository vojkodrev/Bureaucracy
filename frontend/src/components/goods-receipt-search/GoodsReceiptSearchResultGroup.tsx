import { Fragment } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDate } from '@/lib/formatters'
import type { GoodsReceipt } from '@/lib/goods-receipt-types'

export default function GoodsReceiptSearchResultGroup({ receipt }: { receipt: GoodsReceipt }) {
    const productNames = receipt.items
        .map(({ productName }) => productName?.trim())
        .filter((name): name is string => Boolean(name))
        .join(', ')

    return (
        <Fragment>
            <TableRow className="bg-muted/60 font-semibold">
                <TableCell>Goods receipt {receipt.receiptNumber || '—'}</TableCell>
                <TableCell>{formatDate(receipt.receiptDate)}</TableCell>
                <TableCell>{receipt.receivedBy || '—'}</TableCell>
                <TableCell>
                    {productNames ? (
                        <Tooltip>
                            <TooltipTrigger className="block max-w-md truncate text-left">
                                {productNames}
                            </TooltipTrigger>
                            <TooltipContent>{productNames}</TooltipContent>
                        </Tooltip>
                    ) : '—'}
                </TableCell>
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
