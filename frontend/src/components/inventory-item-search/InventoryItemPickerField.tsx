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
import type { InventoryItem } from '@/lib/inventory-item-types'
import InventoryItemSearch from './InventoryItemSearch'

type Props = {
    inventoryItemCode: string
    id: string
    label: string
    name: string
    onInventoryItemCodeChange: (code: string) => void
    onInventoryItemNameChange: (name: string) => void
}

export default function InventoryItemPickerField({
    inventoryItemCode,
    id,
    label,
    name,
    onInventoryItemCodeChange,
    onInventoryItemNameChange,
}: Props) {
    const [open, setOpen] = useState(false)

    function selectInventoryItem(item: InventoryItem) {
        setOpen(false)
        onInventoryItemCodeChange(item.productCode ?? '')
        onInventoryItemNameChange(item.name ?? '')
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="search"
                    name={name}
                    value={inventoryItemCode}
                    autoComplete="off"
                    onChange={(event) => onInventoryItemCodeChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Search inventory items"
                        onClick={() => setOpen(true)}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Select inventory item</DialogTitle>
                        <DialogDescription>
                            Search for an inventory item and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <InventoryItemSearch
                        mode={ComponentMode.Dialog}
                        onInventoryItemSelect={selectInventoryItem}
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
