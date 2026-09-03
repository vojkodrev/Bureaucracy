import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import ProductSearch from '@/components/ProductSearch'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group'
import { ComponentMode } from '@/lib/component-mode'
import type { Product } from '@/lib/product-types'

type ProductPickerFieldProps = {
    productCode: string
    id: string
    label: string
    name: string
    onProductCodeChange: (productCode: string) => void
    onProductNameChange: (productName: string) => void
}

function ProductPickerField({
    productCode,
    id,
    label,
    name,
    onProductCodeChange,
    onProductNameChange,
}: ProductPickerFieldProps) {
    const [open, setOpen] = useState(false)

    function selectProduct(product: Product) {
        setOpen(false)
        onProductCodeChange(product.productCode ?? '')
        onProductNameChange(product.name ?? '')
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="search"
                    name={name}
                    value={productCode}
                    autoComplete="off"
                    onChange={(event) => onProductCodeChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Search products"
                        onClick={() => setOpen(true)}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Select product</DialogTitle>
                        <DialogDescription>
                            Search for a product and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <ProductSearch
                        mode={ComponentMode.Dialog}
                        onProductSelect={selectProduct}
                    />
                    <DialogFooter>
                        <DialogClose
                            render={<Button type="button" variant="outline" />}
                        >
                            Cancel
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Field>
    )
}

export default ProductPickerField
