import { MinusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import InvoiceSearch from "@/components/invoice-search/InvoiceSearch";
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
import type { PaymentStatus } from "@/components/invoice-search/types";

type InvoicePickerFieldProps = {
    invoiceNumber: string;
    id: string;
    label: string;
    name: string;
    onInvoiceNumberChange: (invoiceNumber: string) => void;
    onInvoiceSelect?: (invoice: Invoice) => void;
    minimizable?: boolean;
    defaultPaymentStatus?: PaymentStatus;
};

function InvoicePickerField({
    invoiceNumber,
    id,
    label,
    name,
    onInvoiceNumberChange,
    onInvoiceSelect,
    minimizable = false,
    defaultPaymentStatus,
}: InvoicePickerFieldProps) {
    const [open, setOpen] = useState(false);

    function selectInvoice(invoice: Invoice) {
        onInvoiceNumberChange(invoice.invoiceNumber);
        onInvoiceSelect?.(invoice);
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
                <DialogContent
                    keepMounted={minimizable}
                    className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[calc(100%-2rem)]"
                >
                    {minimizable && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute top-2 right-10"
                            aria-label="Minimize invoice search"
                            title="Minimize invoice search"
                            onClick={() => setOpen(false)}
                        >
                            <MinusIcon />
                        </Button>
                    )}
                    <DialogHeader>
                        <DialogTitle>Select invoice</DialogTitle>
                        <DialogDescription>
                            Search for an invoice and select a row.
                        </DialogDescription>
                    </DialogHeader>
                    <InvoiceSearch
                        mode={ComponentMode.Dialog}
                        onInvoiceSelect={selectInvoice}
                        defaultPaymentStatus={defaultPaymentStatus}
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
