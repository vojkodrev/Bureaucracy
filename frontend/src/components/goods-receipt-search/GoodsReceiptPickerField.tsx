import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
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
import type { GoodsReceipt } from '@/lib/goods-receipt-types'
import GoodsReceiptSearch from './GoodsReceiptSearch'

type Props = {
    goodsReceiptNumber: string
    id: string
    label: string
    name: string
    onGoodsReceiptNumberChange: (receiptNumber: string) => void
    onGoodsReceiptSelect?: (receipt: GoodsReceipt) => void
    defaultInventoryItemCode?: string
}

export default function GoodsReceiptPickerField({
    goodsReceiptNumber,
    id,
    label,
    name,
    onGoodsReceiptNumberChange,
    onGoodsReceiptSelect,
    defaultInventoryItemCode,
}: Props) {
    const [open, setOpen] = useState(false)

    function selectGoodsReceipt(receipt: GoodsReceipt) {
        onGoodsReceiptNumberChange(receipt.receiptNumber)
        onGoodsReceiptSelect?.(receipt)
        setOpen(false)
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="search"
                    name={name}
                    value={goodsReceiptNumber}
                    autoComplete="off"
                    onChange={(event) =>
                        onGoodsReceiptNumberChange(event.target.value)
                    }
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Search goods receipts"
                        onClick={() => setOpen(true)}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Select goods receipt</DialogTitle>
                        <DialogDescription>
                            Search for a goods receipt and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <GoodsReceiptSearch
                        mode={ComponentMode.Dialog}
                        defaultInventoryItemCode={defaultInventoryItemCode}
                        onGoodsReceiptSelect={selectGoodsReceipt}
                    />
                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancel
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Field>
    )
}
