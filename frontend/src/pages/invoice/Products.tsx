import { useState } from 'react'
import { ArrowDown, ArrowUp, ClipboardPaste, Copy, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import type { InvoiceItem } from '@/lib/invoice-types'
import { toast } from '@/lib/toast'
import AddEditProductDialog from './AddEditProductDialog'
import RemoveProductAlert from './RemoveProductAlert'

const PRODUCT_ROW_CLIPBOARD_TYPE = 'bureaucracy/invoice-product-row'

type ProductRowClipboardData = {
    type: typeof PRODUCT_ROW_CLIPBOARD_TYPE
    version: 1
    item: InvoiceItem
}

const isNullableNumber = (value: unknown): value is number | null =>
    value === null || typeof value === 'number' && Number.isFinite(value)
const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === 'string'

function isProductRowClipboardData(value: unknown): value is ProductRowClipboardData {
    if (typeof value !== 'object' || value === null) return false
    const payload = value as Record<string, unknown>
    if (
        payload.type !== PRODUCT_ROW_CLIPBOARD_TYPE ||
        payload.version !== 1 ||
        typeof payload.item !== 'object' ||
        payload.item === null
    ) return false

    const item = payload.item as Record<string, unknown>
    return typeof item.id === 'number' &&
        isNullableNumber(item.sequence) &&
        isNullableString(item.productCode) &&
        isNullableString(item.productName) &&
        (item.unit === undefined || isNullableString(item.unit)) &&
        (item.taxCode === undefined || isNullableString(item.taxCode)) &&
        (item.taxRate === undefined || isNullableNumber(item.taxRate)) &&
        isNullableNumber(item.unitPrice) &&
        isNullableNumber(item.unitTaxAmount) &&
        isNullableNumber(item.quantity) &&
        isNullableNumber(item.discount) &&
        isNullableNumber(item.netAmount) &&
        isNullableNumber(item.grossAmount) &&
        (item.originalInvoiceNumber === undefined ||
            isNullableString(item.originalInvoiceNumber))
}

type ProductsProps = {
    items: InvoiceItem[]
    isLoading: boolean
    onItemsChange: (items: InvoiceItem[]) => void
    documentName?: string
    showOriginalInvoice?: boolean
}

function Products({
    items,
    isLoading,
    onItemsChange,
    documentName = 'invoice',
    showOriginalInvoice = false,
}: ProductsProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const editingItem = editingIndex == null ? null : items[editingIndex] ?? null

    function appendItem(item: InvoiceItem) {
        onItemsChange([...items, {
            ...item,
            id: Math.min(0, ...items.map(({ id }) => id)) - 1,
            sequence: Math.max(0, ...items.map(({ sequence }) => sequence ?? 0)) + 1,
        }])
    }
    function saveItem(item: InvoiceItem) {
        if (editingIndex == null) {
            appendItem(item)
        } else {
            onItemsChange(items.map((current, index) => index === editingIndex
                ? { ...item, id: current.id, sequence: current.sequence }
                : current))
        }
        setDialogOpen(false)
    }
    async function copyItem(item: InvoiceItem) {
        try {
            const payload: ProductRowClipboardData = {
                type: PRODUCT_ROW_CLIPBOARD_TYPE,
                version: 1,
                item,
            }
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
            toast.add({
                title: 'Product row copied',
                description: 'The product row was copied as JSON.',
                type: 'success',
            })
        } catch {
            toast.add({
                title: 'Product row could not be copied',
                description: 'Clipboard access was unavailable.',
                type: 'error',
            })
        }
    }
    async function pasteItem() {
        try {
            const payload: unknown = JSON.parse(await navigator.clipboard.readText())
            if (!isProductRowClipboardData(payload)) {
                throw new Error('Invalid product row clipboard data')
            }
            appendItem(payload.item)
            toast.add({
                title: 'Product row pasted',
                description: `The copied product was added to the ${documentName}.`,
                type: 'success',
            })
        } catch {
            toast.add({
                title: 'Product row could not be pasted',
                description: 'Copy a product row and try again.',
                type: 'error',
            })
        }
    }
    function moveItem(index: number, direction: -1 | 1) {
        const targetIndex = index + direction
        if (targetIndex < 0 || targetIndex >= items.length) return
        const reorderedItems = [...items]
        ;[reorderedItems[index], reorderedItems[targetIndex]] = [
            reorderedItems[targetIndex],
            reorderedItems[index],
        ]
        onItemsChange(reorderedItems.map((item, itemIndex) => ({
            ...item,
            sequence: itemIndex + 1,
        })))
    }

    const columnCount = showOriginalInvoice ? 11 : 10
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            setEditingIndex(null)
                            setDialogOpen(true)
                        }}
                    ><Plus />Add product</Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { void pasteItem() }}
                    ><ClipboardPaste />Paste product</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Product code</TableHead>
                            <TableHead>Product name</TableHead>
                            {showOriginalInvoice && <TableHead>Original invoice</TableHead>}
                            <TableHead className="text-right">Unit price</TableHead>
                            <TableHead className="text-right">Unit tax</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Net amount</TableHead>
                            <TableHead className="text-right">Gross amount</TableHead>
                            <TableHead className="w-28">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <MessageRow colSpan={columnCount}>
                                Loading {documentName} items…
                            </MessageRow>
                        )}
                        {!isLoading && items.length === 0 && (
                            <MessageRow colSpan={columnCount}>
                                No {documentName} items found.
                            </MessageRow>
                        )}
                        {!isLoading && items.map((item, index) => (
                            <ProductRow
                                key={`${item.id}-${index}`}
                                item={item}
                                index={index}
                                itemCount={items.length}
                                showOriginalInvoice={showOriginalInvoice}
                                onMove={moveItem}
                                onCopy={copyItem}
                                onEdit={(selectedIndex) => {
                                    setEditingIndex(selectedIndex)
                                    setDialogOpen(true)
                                }}
                                onRemove={() => onItemsChange(items.filter(
                                    (_, itemIndex) => itemIndex !== index,
                                ))}
                            />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {dialogOpen && (
                <AddEditProductDialog
                    key={editingIndex ?? 'new'}
                    open
                    item={editingItem}
                    showOriginalInvoice={showOriginalInvoice}
                    onOpenChange={setDialogOpen}
                    onSave={saveItem}
                />
            )}
        </Card>
    )
}

type ProductRowProps = {
    item: InvoiceItem
    index: number
    itemCount: number
    showOriginalInvoice: boolean
    onMove: (index: number, direction: -1 | 1) => void
    onCopy: (item: InvoiceItem) => Promise<void>
    onEdit: (index: number) => void
    onRemove: () => void
}

function ProductRow(props: ProductRowProps) {
    const { item, index } = props
    const name = item.productName ?? item.productCode ?? 'product'
    return (
        <TableRow>
            <TableCell>{item.sequence ?? '—'}</TableCell>
            <TableCell className="font-medium">{item.productCode ?? '—'}</TableCell>
            <TableCell>{item.productName ?? '—'}</TableCell>
            {props.showOriginalInvoice && (
                <TableCell>{item.originalInvoiceNumber ?? '—'}</TableCell>
            )}
            <MoneyCell value={item.unitPrice} />
            <MoneyCell value={item.unitTaxAmount} />
            <TableCell className="text-right">{item.quantity ?? '—'}</TableCell>
            <TableCell className="text-right">
                {item.discount == null ? '—' : `${item.discount}%`}
            </TableCell>
            <MoneyCell value={item.netAmount} />
            <MoneyCell value={item.grossAmount} />
            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Move ${name} up`}
                        disabled={index === 0}
                        onClick={() => props.onMove(index, -1)}
                    ><ArrowUp /></Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Move ${name} down`}
                        disabled={index === props.itemCount - 1}
                        onClick={() => props.onMove(index, 1)}
                    ><ArrowDown /></Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Copy ${name}`}
                        onClick={() => { void props.onCopy(item) }}
                    ><Copy /></Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Edit ${name}`}
                        onClick={() => props.onEdit(index)}
                    ><Pencil /></Button>
                    <RemoveProductAlert productName={name} onRemove={props.onRemove} />
                </div>
            </TableCell>
        </TableRow>
    )
}

function MessageRow({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                {children}
            </TableCell>
        </TableRow>
    )
}

function MoneyCell({ value }: { value: number | null }) {
    return (
        <TableCell className="text-right">
            {value == null ? '—' : formatCurrency(value)}
        </TableCell>
    )
}

export default Products
