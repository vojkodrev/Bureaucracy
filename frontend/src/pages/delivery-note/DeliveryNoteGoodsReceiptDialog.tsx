import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import GoodsReceiptPickerField from '@/components/goods-receipt-search/GoodsReceiptPickerField'
import InventoryItemPickerField from '@/components/inventory-item-search/InventoryItemPickerField'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { dateForInput } from '@/lib/dates'
import { fetchGoodsReceipt } from '../goods-receipt/goods-receipt-api'
import { storeGoodsReceiptHandoff } from '../goods-receipt/goods-receipt-handoff'
import { fetchInventoryItem } from '../inventory-item/inventory-item-api'
import type { DeliveryNoteDraft } from './hooks/useDeliveryNoteDraft'

type Props = {
    draft: DeliveryNoteDraft
    onClose: () => void
    allowNavigation: () => void
}

export default function DeliveryNoteGoodsReceiptDialog({ draft, onClose, allowNavigation }: Props) {
    const navigate = useNavigate()
    const [destination, setDestination] = useState('new')
    const [receiptNumber, setReceiptNumber] = useState('')
    const [mappings, setMappings] = useState<Record<number, { code: string; name: string }>>({})
    const [error, setError] = useState<string | null>(null)
    const [isPreparing, setIsPreparing] = useState(false)
    const request = useRef<AbortController | null>(null)
    useEffect(() => () => request.current?.abort(), [])

    async function convert() {
        if (!canConvert || request.current) return
        const existing = destination === 'existing'
        const receiptDate = draft.issueDate ?? draft.deliveryDate
        if (!existing && !receiptDate) {
            setError('Enter a date on the delivery note before converting it.')
            return
        }

        const controller = new AbortController()
        request.current = controller
        setIsPreparing(true)
        setError(null)
        try {
            const [receipt, items] = await Promise.all([
                existing ? fetchGoodsReceipt(receiptNumber.trim(), controller.signal) : null,
                Promise.all(draft.items.map(async (product, index) => {
                    const item = await fetchInventoryItem(mappings[index].code.trim(), controller.signal)
                    return {
                        id: -index - 1,
                        productCode: item.productCode,
                        productName: item.name,
                        unit: item.unit,
                        quantity: product.quantity == null ? null : -Math.abs(product.quantity),
                        photos: [],
                    }
                })),
            ])
            if (controller.signal.aborted) return

            storeGoodsReceiptHandoff({
                receiptNumber: receipt?.receiptNumber ?? null,
                receiptDate: receiptDate ? dateForInput(receiptDate) : null,
                items,
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

    const canConvert = draft.items.length > 0 &&
        draft.items.every((_, index) => mappings[index]?.code.trim()) &&
        (destination === 'new' || Boolean(receiptNumber.trim()))

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !isPreparing) onClose() }}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-[min(70rem,calc(100%_-_2rem))]">
                <DialogHeader>
                    <DialogTitle>Convert to goods receipt</DialogTitle>
                    <DialogDescription>Choose a receipt and map each product to an inventory item.</DialogDescription>
                </DialogHeader>
                {error && <ErrorAlert title="Delivery note could not be converted" description="" error={error} />}
                <fieldset
                    disabled={isPreparing}
                    className="min-w-0 space-y-4 [&>[data-slot=table-container]]:overflow-visible"
                >
                    <RadioGroup aria-label="Goods receipt destination" value={destination} onValueChange={setDestination}>
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
                                <TableHead className="w-1/4 whitespace-normal sm:w-48">Inventory item</TableHead>
                                <TableHead className="whitespace-normal">Inventory item name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {draft.items.map((product, index) => (
                                <TableRow key={`${product.id}-${index}`}>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {product.productCode}
                                    </TableCell>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {product.productName}
                                    </TableCell>
                                    <TableCell>
                                        <InventoryItemPickerField
                                            id={`conversion-inventory-item-${index}`}
                                            name={`inventoryItem-${index}`}
                                            label={`Inventory item for ${product.productName || product.productCode || `product ${index + 1}`}`}
                                            hideLabel
                                            minimizable
                                            inventoryItemCode={mappings[index]?.code ?? ''}
                                            onInventoryItemCodeChange={(code) => setMappings((current) => ({
                                                ...current,
                                                [index]: { code, name: '' },
                                            }))}
                                            onInventoryItemNameChange={(name) => setMappings((current) => ({
                                                ...current,
                                                [index]: { ...current[index], name },
                                            }))}
                                        />
                                    </TableCell>
                                    <TableCell className="whitespace-normal [overflow-wrap:anywhere]">
                                        {mappings[index]?.name}
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
