import { useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { GoodsReceipt } from '@/lib/goods-receipt-types'

type Props = {
    goodsReceipts: GoodsReceipt[]
}

export default function GoodsReceiptSearchSummary({ goodsReceipts }: Props) {
    const products = useMemo(() => {
        const productsByCode = new Map<
            string,
            { productCode: string | null; productName: string | null; unit: string | null; quantity: number }
        >()

        for (const receipt of goodsReceipts) {
            for (const item of receipt.items) {
                const key = item.productCode ?? `${item.productName ?? ''}\0${item.unit ?? ''}`
                const product = productsByCode.get(key)

                if (product) {
                    product.quantity += item.quantity ?? 0
                } else {
                    productsByCode.set(key, {
                        productCode: item.productCode,
                        productName: item.productName,
                        unit: item.unit,
                        quantity: item.quantity ?? 0,
                    })
                }
            }
        }

        return [...productsByCode.values()]
    }, [goodsReceipts])

    return (
        <div className="mt-8 max-w-2xl">
            <h2 className="mb-2 text-sm font-medium">Summary</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Inventory item code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.productCode ?? `${product.productName ?? ''}\0${product.unit ?? ''}`}>
                            <TableCell className="font-medium">
                                {product.productCode || '—'}
                            </TableCell>
                            <TableCell>{product.productName || '—'}</TableCell>
                            <TableCell className="text-right font-medium tabular-nums">
                                {product.quantity.toLocaleString('en-IE')}
                                {product.unit ? ` ${product.unit}` : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
