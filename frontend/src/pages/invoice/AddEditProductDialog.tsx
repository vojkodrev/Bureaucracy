import { useState } from 'react'
import ProductPickerField from '@/components/ProductPickerField'
import TaxCodeComboboxField from '@/components/TaxCodeComboboxField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
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
    const [taxCode, setTaxCode] = useState(item?.taxCode ?? '')
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
    const canSave = code.trim().length > 0 &&
        quantityValue != null &&
        quantityValue > 0 &&
        unitPriceValue != null &&
        unitPriceValue >= 0 &&
        taxCode.trim().length > 0 &&
        taxRateValue != null &&
        taxRateValue >= 0 &&
        discountValue >= 0 &&
        discountValue <= 100

    const save = () => onSave({
        id: item?.id ?? 0,
        sequence: item?.sequence ?? null,
        productCode: code.trim(),
        productName: name.trim() || null,
        unit: unit.trim() || null,
        taxCode: taxCode.trim() || null,
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
                    <ProductPickerField id="new-product-code" label="Product code" name="newProductCode" productCode={code} onProductCodeChange={setCode} onProductNameChange={setName} onProductUnitChange={setUnit} onProductNetPriceChange={(value) => setNetPrice(value == null ? '' : String(value))} onProductTaxRateChange={(value) => setTaxRate(value == null ? '' : String(value))} onProductTaxCodeChange={setTaxCode} />
                    <Field><FieldLabel htmlFor="new-product-name">Product name</FieldLabel><Input id="new-product-name" value={name} disabled /></Field>
                    <Field><FieldLabel htmlFor="new-product-unit">Unit</FieldLabel><Input id="new-product-unit" value={unit} disabled /></Field>
                    <Field className="sm:col-start-1"><FieldLabel htmlFor="new-product-quantity">Quantity</FieldLabel><NumberInput id="new-product-quantity" min="0" step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field>
                </div>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    <Field><FieldLabel htmlFor="new-product-net-unit-price">Net unit price</FieldLabel><NumberInput id="new-product-net-unit-price" min="0" step="0.01" value={netPrice} onChange={(event) => setNetPrice(event.target.value)} /></Field>
                    <Field><FieldLabel htmlFor="new-product-tax-base">Taxable amount</FieldLabel><Input id="new-product-tax-base" value={decimalValue(taxBase)} disabled /></Field>
                    <Field><FieldLabel htmlFor="new-product-net-value">Net amount before discount</FieldLabel><Input id="new-product-net-value" value={decimalValue(netValue)} disabled /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <TaxCodeComboboxField id="new-product-tax-code" label="Tax code" value={taxCode} onChange={(selectedCode, rate) => { setTaxCode(selectedCode); setTaxRate(rate == null ? '' : String(rate)) }} />
                        <Field><FieldLabel htmlFor="new-product-tax-rate">VAT rate (%)</FieldLabel><NumberInput id="new-product-tax-rate" step="0.01" value={taxRate} disabled /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field><FieldLabel htmlFor="new-product-discount">Discount (%)</FieldLabel><NumberInput id="new-product-discount" min="0" max="100" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></Field>
                        <Field><FieldLabel htmlFor="new-product-discount-amount">Discount amount</FieldLabel><Input id="new-product-discount-amount" value={decimalValue(discountAmount)} disabled /></Field>
                    </div>
                    <Field><FieldLabel htmlFor="new-product-tax-amount">VAT amount</FieldLabel><Input id="new-product-tax-amount" value={decimalValue(taxAmount)} disabled /></Field>
                    <Field className="sm:col-start-2"><FieldLabel htmlFor="new-product-gross-value">Gross amount</FieldLabel><Input id="new-product-gross-value" value={decimalValue(grossValue)} disabled /></Field>
                    <Field className="sm:col-start-2"><FieldLabel htmlFor="new-product-gross-unit-price">Gross unit price</FieldLabel><Input id="new-product-gross-unit-price" value={decimalValue(grossUnitPrice)} disabled /></Field>
                </div>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                    <DialogClose render={<Button type="button" disabled={!canSave} onClick={save} />}>{item ? 'Save' : 'Add'}</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddEditProductDialog
