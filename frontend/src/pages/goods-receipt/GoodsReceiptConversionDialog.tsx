import { useEffect, useRef, useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import { fetchGoodsReceiptSearch } from '@/components/goods-receipt-search/goods-receipt-search-api'
import GoodsReceiptPickerField from '@/components/goods-receipt-search/GoodsReceiptPickerField'
import InventoryItemPickerField from '@/components/inventory-item-search/InventoryItemPickerField'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { NumberInput } from '@/components/ui/number-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { dateForInput } from '@/lib/dates'
import { numberOrNull } from '@/lib/numbers'
import { fetchGoodsReceipt } from './goods-receipt-api'
import { storeGoodsReceiptHandoff } from './goods-receipt-handoff'
import { fetchInventoryItem } from '../inventory-item/inventory-item-api'

type ConversionProduct = {
    productCode: string | null
    productName: string | null
    quantity: number | null
}

type Props = {
    source: 'Delivery note' | 'Invoice'
    conversionDate: Date | null | undefined
    items: readonly ConversionProduct[]
    onClose: () => void
    allowNavigation: () => void
}

type ConversionRow = {
    id: number
    product: ConversionProduct
    quantity: string
    inventoryCode: string
    inventoryName: string
}

export default function GoodsReceiptConversionDialog({ source, conversionDate, items, onClose, allowNavigation }: Props) {
    const navigate = useNavigate()
    const receiptDate = conversionDate ? dateForInput(conversionDate) : ''
    const [destination, setDestination] = useState('new')
    const [receiptNumber, setReceiptNumber] = useState('')
    const [receiptLookup, setReceiptLookup] = useState<{ date: string; message?: string } | null>(null)
    const [conversionRows, setConversionRows] = useState<ConversionRow[]>(() =>
        items.map((product, index) => ({
            id: index,
            product,
            quantity: String(product.quantity ?? ''),
            inventoryCode: '',
            inventoryName: '',
        })),
    )
    const nextRowId = useRef(items.length)
    const [error, setError] = useState<string | null>(null)
    const [isPreparing, setIsPreparing] = useState(false)
    const request = useRef<AbortController | null>(null)
    useEffect(() => () => request.current?.abort(), [])

    const isLookingUpReceipt = Boolean(receiptDate && receiptLookup?.date !== receiptDate)
    useEffect(() => {
        if (!receiptDate) return
        const controller = new AbortController()
        void fetchGoodsReceiptSearch({
            receiptNumber: '',
            from: receiptDate,
            to: receiptDate,
            inventoryItemCode: '',
            inventoryItemName: '',
            page: '1',
            pageSize: '1',
            sortBy: '',
            sortDirection: '',
        }, controller.signal).then((page) => {
            if (controller.signal.aborted) return
            const number = page?.goodsReceipts[0]?.receiptNumber.trim() ?? ''
            setReceiptNumber(number)
            setDestination(number ? 'existing' : 'new')
            setReceiptLookup({ date: receiptDate })
        }).catch(() => {
            if (!controller.signal.aborted) {
                setReceiptLookup({
                    date: receiptDate,
                    message: 'Could not check for a matching goods receipt. Choose a destination.',
                })
            }
        })
        return () => controller.abort()
    }, [receiptDate])

    function updateRow(id: number, changes: Partial<Pick<ConversionRow, 'quantity' | 'inventoryCode' | 'inventoryName'>>) {
        setConversionRows((rows) => rows.map((row) => row.id === id ? { ...row, ...changes } : row))
    }

    function duplicateRow(id: number) {
        const copyId = nextRowId.current++
        setConversionRows((rows) => rows.flatMap((row) =>
            row.id === id ? [row, { ...row, id: copyId }] : [row],
        ))
    }

    async function convert() {
        if (!canConvert || request.current) return
        const existing = destination === 'existing'
        if (!existing && !receiptDate) {
            setError(`Enter a date on the ${source.toLowerCase()} before converting it.`)
            return
        }

        const controller = new AbortController()
        request.current = controller
        setIsPreparing(true)
        setError(null)
        try {
            const [receipt, receiptItems] = await Promise.all([
                existing ? fetchGoodsReceipt(receiptNumber.trim(), controller.signal) : null,
                Promise.all(conversionRows.map(async ({ id, quantity, inventoryCode }) => {
                    const quantityValue = numberOrNull(quantity)
                    const item = await fetchInventoryItem(inventoryCode.trim(), controller.signal)
                    return {
                        id: -id - 1,
                        productCode: item.productCode,
                        productName: item.name,
                        unit: item.unit,
                        quantity: quantityValue == null ? null : -Math.abs(quantityValue),
                        photos: [],
                    }
                })),
            ])
            if (controller.signal.aborted) return

            storeGoodsReceiptHandoff({
                receiptNumber: receipt?.receiptNumber ?? null,
                receiptDate: receiptDate || null,
                items: receiptItems,
            })
            allowNavigation()
            navigate(receipt ? `/goods-receipt/${encodeURIComponent(receipt.receiptNumber)}` : '/goods-receipt')
        } catch (cause) {
            if (!controller.signal.aborted) {
                setError(cause instanceof Error ? cause.message : 'Preparing the goods receipt failed.')
            }
        } finally {
            if (!controller.signal.aborted) setIsPreparing(false)
            controller.abort()
            request.current = null
        }
    }

    const canConvert = !isLookingUpReceipt && conversionRows.length > 0 &&
        conversionRows.every(({ inventoryCode }) => inventoryCode.trim()) &&
        (destination === 'new' || Boolean(receiptNumber.trim()))

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !isPreparing) onClose() }}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-[min(70rem,calc(100%_-_2rem))]">
                <DialogHeader>
                    <DialogTitle>Convert to goods receipt</DialogTitle>
                    <DialogDescription>Choose a receipt and map each product to an inventory item.</DialogDescription>
                </DialogHeader>
                {error && <ErrorAlert title={`${source} could not be converted`} description="" error={error} />}
                <fieldset
                    disabled={isPreparing}
                    className="min-w-0 space-y-4 [&>[data-slot=table-container]]:overflow-visible"
                >
                    {(isLookingUpReceipt || (receiptLookup?.date === receiptDate && receiptLookup.message)) && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {isLookingUpReceipt ? 'Checking for a goods receipt on this date…' : receiptLookup?.message}
                        </p>
                    )}
                    <RadioGroup
                        aria-label="Goods receipt destination"
                        disabled={isLookingUpReceipt}
                        value={destination}
                        onValueChange={setDestination}
                    >
                        <Field orientation="horizontal">
                            <RadioGroupItem id="goods-receipt-create" value="new" />
                            <FieldLabel htmlFor="goods-receipt-create">Create new goods receipt</FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                            <RadioGroupItem id="goods-receipt-append" value="existing" />
                            <FieldLabel htmlFor="goods-receipt-append">Add to existing</FieldLabel>
                        </Field>
                    </RadioGroup>
                    {destination === 'existing' && (
                        <div className="max-w-96">
                            <GoodsReceiptPickerField
                                id="conversion-receipt-number"
                                name="receiptNumber"
                                label="Goods receipt number"
                                goodsReceiptNumber={receiptNumber}
                                onGoodsReceiptNumberChange={setReceiptNumber}
                            />
                        </div>
                    )}
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 whitespace-normal sm:w-28">Product code</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-20 px-1 sm:w-28 sm:px-2">Quantity</TableHead>
                                <TableHead className="w-1/4 whitespace-normal sm:w-48">Inventory item</TableHead>
                                <TableHead className="whitespace-normal">Inventory item name</TableHead>
                                <TableHead className="w-20">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {conversionRows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No products to convert.
                                    </TableCell>
                                </TableRow>
                            )}
                            {conversionRows.map(({ id, product, quantity, inventoryCode, inventoryName }, index) => (
                                <TableRow key={id}>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {product.productCode}
                                    </TableCell>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {product.productName}
                                    </TableCell>
                                    <TableCell className="px-1 sm:px-2">
                                        <NumberInput
                                            aria-label={`Quantity for ${product.productName || product.productCode || `product ${index + 1}`}`}
                                            className="px-2 text-right tabular-nums"
                                            step="any"
                                            value={quantity}
                                            onChange={(event) => updateRow(id, { quantity: event.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <InventoryItemPickerField
                                            id={`conversion-inventory-item-${id}`}
                                            name={`inventoryItem-${id}`}
                                            label={`Inventory item for ${product.productName || product.productCode || `product ${index + 1}`}`}
                                            hideLabel
                                            minimizable
                                            inventoryItemCode={inventoryCode}
                                            onInventoryItemCodeChange={(code) => updateRow(id, { inventoryCode: code, inventoryName: '' })}
                                            onInventoryItemNameChange={(name) => updateRow(id, { inventoryName: name })}
                                        />
                                    </TableCell>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {inventoryName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label={`Duplicate ${product.productName || product.productCode || `product ${index + 1}`}`}
                                                onClick={() => duplicateRow(id)}
                                            >
                                                <Copy />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger render={
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        aria-label={`Remove ${product.productName || product.productCode || `product ${index + 1}`}`}
                                                    />
                                                }>
                                                    <Trash2 />
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove product?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove {product.productName || product.productCode || 'this product'} from this conversion?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() => setConversionRows((rows) => rows.filter((row) => row.id !== id))}
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </fieldset>
                <DialogFooter>
                    <Button type="button" variant="outline" disabled={isPreparing} onClick={onClose}>Cancel</Button>
                    <Button type="button" disabled={!canConvert || isPreparing} onClick={() => { void convert() }}>
                        {isPreparing ? 'Preparing…' : 'Convert'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
