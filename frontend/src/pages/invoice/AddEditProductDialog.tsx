import { useState } from 'react'
import ProductPickerField from '@/components/ProductPickerField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { InvoiceItem } from '@/lib/invoice-types'

type AddEditProductDialogProps = {
    open: boolean
    item: InvoiceItem | null
    onOpenChange: (open: boolean) => void
    onSave: (item: InvoiceItem) => void
}

const optionalNumber = (value: string) => value.trim() && Number.isFinite(Number(value)) ? Number(value) : null
const decimalValue = (value: number | null) => value == null ? '' : value.toFixed(2)

function AddEditProductDialog({ open, item, onOpenChange, onSave }: AddEditProductDialogProps) {
    const effectiveTaxRate = item?.taxRate ?? (item?.unitPrice && item.unitTaxAmount != null ? item.unitTaxAmount / item.unitPrice * 100 : null)
    const [code, setCode] = useState(item?.productCode ?? '')
    const [name, setName] = useState(item?.productName ?? '')
    const [unit, setUnit] = useState(item?.unit ?? '')
    const [quantity, setQuantity] = useState(item?.quantity == null ? '' : String(item.quantity))
    const [netPrice, setNetPrice] = useState(item?.unitPrice == null ? '' : String(item.unitPrice))
    const [taxRate, setTaxRate] = useState(effectiveTaxRate == null ? '' : String(effectiveTaxRate))
    const [discount, setDiscount] = useState(item?.discount == null ? '0' : String(item.discount))

    const quantityValue = optionalNumber(quantity)
    const unitPriceValue = optionalNumber(netPrice)
    const taxRateValue = optionalNumber(taxRate)
    const discountValue = optionalNumber(discount) ?? 0
    const netValue = quantityValue == null || unitPriceValue == null ? null : quantityValue * unitPriceValue
    const discountAmount = netValue == null ? null : netValue * discountValue / 100
    const taxBase = netValue == null || discountAmount == null ? null : netValue - discountAmount
    const taxAmount = taxBase == null || taxRateValue == null ? null : taxBase * taxRateValue / 100
    const grossValue = taxBase == null || taxAmount == null ? null : taxBase + taxAmount
    const grossUnitPrice = unitPriceValue == null || taxRateValue == null ? null : unitPriceValue * (1 + taxRateValue / 100)

    const save = () => onSave({
        id: item?.id ?? 0,
        sequence: item?.sequence ?? null,
        productCode: code.trim(),
        productName: name.trim() || null,
        unit: unit.trim() || null,
        taxRate: taxRateValue,
        unitPrice: unitPriceValue,
        unitTaxAmount: unitPriceValue == null || taxRateValue == null ? null : unitPriceValue * taxRateValue / 100,
        quantity: quantityValue,
        discount: discountValue,
        netAmount: taxBase,
        grossAmount: grossValue,
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-3xl">
                <DialogHeader><DialogTitle>{item ? 'Edit product' : 'Add product'}</DialogTitle><DialogDescription>Search for a product or change the line details.</DialogDescription></DialogHeader>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_8rem]">
                    <ProductPickerField id="new-product-code" label="Product code" name="newProductCode" productCode={code} onProductCodeChange={setCode} onProductNameChange={setName} onProductUnitChange={setUnit} onProductNetPriceChange={(value) => setNetPrice(value == null ? '' : String(value))} onProductTaxRateChange={(value) => setTaxRate(value == null ? '' : String(value))} />
                    <Field><FieldLabel htmlFor="new-product-name">Product name</FieldLabel><Input id="new-product-name" value={name} readOnly className="bg-muted/50 text-muted-foreground" /></Field>
                    <Field><FieldLabel htmlFor="new-product-unit">Unit</FieldLabel><Input id="new-product-unit" value={unit} readOnly className="bg-muted/50 text-muted-foreground" /></Field>
                    <Field className="sm:col-start-1"><FieldLabel htmlFor="new-product-quantity">Quantity</FieldLabel><Input id="new-product-quantity" type="number" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field>
                </div>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Field><FieldLabel htmlFor="new-product-net-unit-price">Net unit price</FieldLabel><Input id="new-product-net-unit-price" type="number" step="0.01" value={netPrice} onChange={(event) => setNetPrice(event.target.value)} /></Field>
                    <ReadOnlyAmount id="new-product-tax-base" label="Taxable amount" value={taxBase} />
                    <ReadOnlyAmount id="new-product-net-value" label="Net amount before discount" value={netValue} />
                    <Field><FieldLabel htmlFor="new-product-tax-rate">VAT rate (%)</FieldLabel><Input id="new-product-tax-rate" type="number" step="0.01" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel htmlFor="new-product-discount">Discount (%)</FieldLabel><Input id="new-product-discount" type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></Field>
                        <ReadOnlyAmount id="new-product-discount-amount" label="Discount amount" value={discountAmount} />
                    </div>
                    <ReadOnlyAmount id="new-product-tax-amount" label="VAT amount" value={taxAmount} />
                    <ReadOnlyAmount id="new-product-gross-value" label="Gross amount" value={grossValue} className="sm:col-start-2" />
                    <ReadOnlyAmount id="new-product-gross-unit-price" label="Gross unit price" value={grossUnitPrice} className="sm:col-start-2" />
                </div>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                    <DialogClose render={<Button type="button" onClick={save} />}>{item ? 'Save' : 'Add'}</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ReadOnlyAmount({ id, label, value, className }: { id: string; label: string; value: number | null; className?: string }) {
    return <Field className={className}><FieldLabel htmlFor={id}>{label}</FieldLabel><Input id={id} value={decimalValue(value)} readOnly className="bg-muted/50 text-muted-foreground" /></Field>
}

export default AddEditProductDialog
