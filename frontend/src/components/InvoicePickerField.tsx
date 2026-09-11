import { SearchIcon } from "lucide-react";
import { useState } from "react";
import InvoiceSearch from "@/components/InvoiceSearch";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { ComponentMode } from "@/lib/component-mode";
import type { Invoice } from "@/lib/invoice-types";

type InvoicePickerFieldProps = {
    invoiceNumber: string;
    id: string;
    label: string;
    name: string;
    onInvoiceNumberChange: (invoiceNumber: string) => void;
};

function InvoicePickerField({
    invoiceNumber,
    id,
    label,
    name,
    onInvoiceNumberChange,
}: InvoicePickerFieldProps) {
    const [open, setOpen] = useState(false);

    function selectInvoice(invoice: Invoice) {
        onInvoiceNumberChange(invoice.invoiceNumber);
        setOpen(false);
    }

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type="search"
                    name={name}
                    value={invoiceNumber}
                    autoComplete="off"
                    onChange={(event) =>
                        onInvoiceNumberChange(event.target.value)
                    }
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        size="icon-xs"
                        aria-label="Search invoices"
                        onClick={() => setOpen(true)}
                    >
                        <SearchIcon />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]">
                    <DialogHeader>
                        <DialogTitle>Select invoice</DialogTitle>
                        <DialogDescription>
                            Search for an invoice and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceSearch
                        mode={ComponentMode.Dialog}
                        onInvoiceSelect={selectInvoice}
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
    );
}

export default InvoicePickerField;
