import { MinusIcon, SearchIcon } from 'lucide-react'
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
    hideLabel?: boolean
    minimizable?: boolean
    name: string
    onInventoryItemCodeChange: (code: string) => void
    onInventoryItemNameChange?: (name: string) => void
    onInventoryItemUnitChange?: (unit: string) => void
}

export default function InventoryItemPickerField({
    inventoryItemCode,
    id,
    label,
    hideLabel,
    minimizable = false,
    name,
    onInventoryItemCodeChange,
    onInventoryItemNameChange,
    onInventoryItemUnitChange,
}: Props) {
    const [open, setOpen] = useState(false)
    const [hasOpened, setHasOpened] = useState(false)

    function openSearch() {
        setHasOpened(true)
        setOpen(true)
    }

    function selectInventoryItem(item: InventoryItem) {
        setOpen(false)
        onInventoryItemCodeChange(item.productCode ?? '')
        onInventoryItemNameChange?.(item.name ?? '')
        onInventoryItemUnitChange?.(item.unit ?? '')
    }

    return (
        <Field>
            {!hideLabel && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            <InputGroup>
                <InputGroupInput
                    id={id}
                    aria-label={hideLabel ? label : undefined}
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
                        onClick={openSearch}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    keepMounted={minimizable && hasOpened}
                    className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]"
                >
                    {minimizable && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute top-2 right-10"
                            aria-label="Minimize inventory item search"
                            title="Minimize inventory item search"
                            onClick={() => setOpen(false)}
                        >
                            <MinusIcon />
                        </Button>
                    )}
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
