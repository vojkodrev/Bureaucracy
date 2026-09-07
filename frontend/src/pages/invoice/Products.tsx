import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/formatters'
import type { InvoiceItem } from '@/lib/invoice-types'
import AddEditProductDialog from './AddEditProductDialog'
import RemoveProductAlert from './RemoveProductAlert'

type ProductsProps = {
    items: InvoiceItem[]
    isLoading: boolean
    error: string | null
    onItemsChange: (items: InvoiceItem[]) => void
}

function Products({ items, isLoading, error, onItemsChange }: ProductsProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const openNew = () => { setEditingIndex(null); setDialogOpen(true) }
    const openEdit = (index: number) => { setEditingIndex(index); setDialogOpen(true) }
    const editingItem = editingIndex == null ? null : items[editingIndex] ?? null
    const saveItem = (item: InvoiceItem) => {
        if (editingIndex == null) {
            onItemsChange([...items, { ...item, id: Math.min(0, ...items.map(({ id }) => id)) - 1, sequence: Math.max(0, ...items.map(({ sequence }) => sequence ?? 0)) + 1 }])
        } else {
            onItemsChange(items.map((current, index) => index === editingIndex ? { ...item, id: current.id, sequence: current.sequence } : current))
        }
        setDialogOpen(false)
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle>Products</CardTitle><Button type="button" size="sm" onClick={openNew}><Plus />Add product</Button></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Product code</TableHead><TableHead>Product name</TableHead><TableHead className="text-right">Unit price</TableHead><TableHead className="text-right">Unit tax</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead className="text-right">Discount</TableHead><TableHead className="text-right">Net amount</TableHead><TableHead className="text-right">Gross amount</TableHead><TableHead className="w-16"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading && <MessageRow>Loading invoice items…</MessageRow>}
                        {error && <MessageRow destructive>{error}</MessageRow>}
                        {!isLoading && !error && items.length === 0 && <MessageRow>No invoice items found.</MessageRow>}
                        {!isLoading && !error && items.map((item, index) => {
                            const name = item.productName ?? item.productCode ?? 'product'
                            return (
                                <TableRow key={`${item.id}-${index}`}>
                                    <TableCell>{item.sequence ?? '—'}</TableCell><TableCell className="font-medium">{item.productCode ?? '—'}</TableCell><TableCell>{item.productName ?? '—'}</TableCell>
                                    <MoneyCell value={item.unitPrice} /><MoneyCell value={item.unitTaxAmount} /><TableCell className="text-right">{item.quantity ?? '—'}</TableCell><TableCell className="text-right">{item.discount == null ? '—' : `${item.discount}%`}</TableCell><MoneyCell value={item.netAmount} /><MoneyCell value={item.grossAmount} />
                                    <TableCell><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon-xs" aria-label={`Edit ${name}`} onClick={() => openEdit(index)}><Pencil /></Button><RemoveProductAlert productName={name} onRemove={() => onItemsChange(items.filter((_, itemIndex) => itemIndex !== index))} /></div></TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            {dialogOpen && (
                <AddEditProductDialog
                    key={editingIndex ?? 'new'}
                    open
                    item={editingItem}
                    onOpenChange={setDialogOpen}
                    onSave={saveItem}
                />
            )}
        </Card>
    )
}

function MessageRow({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
    return <TableRow><TableCell colSpan={10} className={`h-24 text-center ${destructive ? 'text-destructive' : 'text-muted-foreground'}`}>{children}</TableCell></TableRow>
}

function MoneyCell({ value }: { value: number | null }) {
    return <TableCell className="text-right">{value == null ? '—' : formatCurrency(value)}</TableCell>
}

export default Products
