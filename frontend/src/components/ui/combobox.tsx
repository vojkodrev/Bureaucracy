import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

const Combobox = ComboboxPrimitive.Root

function ComboboxInput({ className, disabled = false, ...props }: ComboboxPrimitive.Input.Props) {
    return (
        <InputGroup className={cn('w-auto', className)}>
            <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    size="icon-xs"
                    variant="ghost"
                    render={<ComboboxPrimitive.Trigger />}
                    disabled={disabled}
                >
                    <ChevronDownIcon />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}

function ComboboxContent({ className, ...props }: ComboboxPrimitive.Popup.Props) {
    return (
        <ComboboxPrimitive.Portal>
            <ComboboxPrimitive.Positioner side="bottom" sideOffset={6} align="start" className="isolate z-50">
                <ComboboxPrimitive.Popup
                    className={cn('group/combobox-content max-h-(--available-height) w-(--anchor-width) min-w-56 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10', className)}
                    {...props}
                />
            </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
    )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
    return <ComboboxPrimitive.List className={cn('max-h-72 overflow-y-auto p-1 data-empty:p-0', className)} {...props} />
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
    return (
        <ComboboxPrimitive.Item className={cn('relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden data-highlighted:bg-accent data-highlighted:text-accent-foreground', className)} {...props}>
            {children}
            <ComboboxPrimitive.ItemIndicator render={<span className="absolute right-2 flex size-4 items-center justify-center" />}>
                <CheckIcon className="size-4" />
            </ComboboxPrimitive.ItemIndicator>
        </ComboboxPrimitive.Item>
    )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
    return <ComboboxPrimitive.Empty className={cn('hidden justify-center py-2 text-sm text-muted-foreground group-data-empty/combobox-content:flex', className)} {...props} />
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList }
