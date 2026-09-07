import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import CustomerSearch from '@/components/CustomerSearch'
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
import type { Customer } from '@/lib/customer-types'

type CustomerPickerFieldProps = {
    customerId: string
    id: string
    label: string
    name: string
    onCustomerIdChange: (customerId: string) => void
    onCustomerNameChange: (customerName: string) => void
    onCustomerAddressChange?: (customerAddress: string) => void
    onCustomerPostalCodeChange?: (customerPostalCode: string) => void
    onCustomerCityChange?: (customerCity: string) => void
    onCustomerCountryChange?: (customerCountry: string) => void
}

function CustomerPickerField({
    customerId,
    id,
    label,
    name,
    onCustomerIdChange,
    onCustomerNameChange,
    onCustomerAddressChange,
    onCustomerPostalCodeChange,
    onCustomerCityChange,
    onCustomerCountryChange,
}: CustomerPickerFieldProps) {
    const [open, setOpen] = useState(false)

    function selectCustomer(customer: Customer) {
        setOpen(false)
        onCustomerIdChange(customer.customerId ?? '')
        onCustomerNameChange(customer.name ?? '')
        onCustomerAddressChange?.(customer.address ?? '')
        onCustomerPostalCodeChange?.(customer.postalCode ?? '')
        onCustomerCityChange?.(customer.city ?? '')
        onCustomerCountryChange?.(customer.country ?? '')
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="search"
                    name={name}
                    value={customerId}
                    autoComplete="off"
                    onChange={(event) => onCustomerIdChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Search customers"
                        onClick={() => setOpen(true)}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Select customer</DialogTitle>
                        <DialogDescription>
                            Search for a customer and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerSearch
                        mode={ComponentMode.Dialog}
                        onCustomerSelect={selectCustomer}
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

export default CustomerPickerField
