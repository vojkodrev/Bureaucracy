import { useState } from "react";
import { MinusIcon } from "lucide-react";
import BankTransactionTypeComboboxField from "@/components/BankTransactionTypeComboboxField";
import CustomerPickerField from "@/components/customer-search/CustomerPickerField";
import InvoicePickerField from "@/components/invoice-search/InvoicePickerField";
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
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import type { BankStatementEntry } from "@/lib/bank-statement-types";

type Props = {
    entry: BankStatementEntry | null;
    open: boolean;
    onCancel: () => void;
    onOpenChange: (open: boolean) => void;
    onSave: (entry: BankStatementEntry) => void;
};
const numberOrNull = (value: string) =>
    value.trim() === "" ? null : Number(value);

function AddEditTransactionDialog({
    entry,
    open,
    onCancel,
    onOpenChange,
    onSave,
}: Props) {
    const [counterpartyId, setCounterpartyId] = useState(
        entry?.customerId ?? "",
    );
    const [counterparty, setCounterparty] = useState(entry?.customerName ?? "");
    const [transactionTypeId, setTransactionTypeId] = useState(
        entry?.transactionTypeId ?? null,
    );
    const [transactionType, setTransactionType] = useState(
        entry?.transactionType ?? "",
    );
    const [outflow, setOutflow] = useState(
        entry?.outflow == null ? "" : String(entry.outflow),
    );
    const [inflow, setInflow] = useState(
        entry?.inflow == null ? "" : String(entry.inflow),
    );
    const [documentNumber, setDocumentNumber] = useState(
        entry?.documentNumber ?? "",
    );
    const [reference, setReference] = useState(entry?.reference ?? "");
    const [purpose, setPurpose] = useState(entry?.purpose ?? "");
    const outflowValue = numberOrNull(outflow);
    const inflowValue = numberOrNull(inflow);
    const canSave =
        transactionTypeId != null &&
        (outflowValue ?? 0) >= 0 &&
        (inflowValue ?? 0) >= 0 &&
        !((outflowValue ?? 0) > 0 && (inflowValue ?? 0) > 0);
    const save = () =>
        onSave({
            id: entry?.id ?? 0,
            statementId: entry?.statementId ?? 0,
            statementNumber: entry?.statementNumber ?? null,
            paymentDate: entry?.paymentDate ?? null,
            customerId: counterpartyId.trim() || null,
            customerName: counterparty.trim() || null,
            transactionType: transactionType || null,
            transactionTypeId,
            outflow: outflowValue,
            inflow: inflowValue,
            documentNumber: documentNumber.trim() || null,
            reference: reference.trim() || null,
            purpose: purpose.trim() || null,
        });
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                keepMounted
                showCloseButton={false}
                className="sm:max-w-2xl"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                    aria-label="Minimize transaction"
                    title="Minimize transaction"
                    onClick={() => onOpenChange(false)}
                >
                    <MinusIcon />
                </Button>
                <DialogHeader>
                    <DialogTitle>
                        {entry ? "Edit transaction" : "Add transaction"}
                    </DialogTitle>
                    <DialogDescription>
                        Enter the counterparty, transaction type, and amount.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                    <CustomerPickerField
                        minimizable
                        id="transaction-counterparty"
                        label="Counterparty number"
                        name="counterpartyId"
                        customerId={counterpartyId}
                        onCustomerIdChange={setCounterpartyId}
                        onCustomerNameChange={setCounterparty}
                    />
                    <Field>
                        <FieldLabel htmlFor="transaction-counterparty-name">
                            Counterparty
                        </FieldLabel>
                        <Input
                            id="transaction-counterparty-name"
                            value={counterparty}
                            onChange={(event) =>
                                setCounterparty(event.target.value)
                            }
                        />
                    </Field>
                    <InvoicePickerField
                        minimizable
                        defaultPaymentStatus="unpaid"
                        id="transaction-document-number"
                        label="Document number"
                        name="documentNumber"
                        invoiceNumber={documentNumber}
                        onInvoiceNumberChange={setDocumentNumber}
                        onInvoiceSelect={(invoice) => {
                            setCounterpartyId(invoice.customerCode ?? "");
                            setCounterparty(invoice.customerName ?? "");
                        }}
                    />
                    <Field>
                        <FieldLabel htmlFor="transaction-reference">
                            Reference
                        </FieldLabel>
                        <Input
                            id="transaction-reference"
                            maxLength={13}
                            value={reference}
                            onChange={(event) => setReference(event.target.value)}
                        />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="transaction-purpose">
                            Purpose
                        </FieldLabel>
                        <Input
                            id="transaction-purpose"
                            value={purpose}
                            onChange={(event) => setPurpose(event.target.value)}
                        />
                    </Field>
                    <BankTransactionTypeComboboxField
                        id="transaction-type"
                        label="Transaction type"
                        value={transactionTypeId}
                        onChange={(value) => {
                            setTransactionTypeId(value?.code ?? null);
                            setTransactionType(value?.name ?? "");
                        }}
                    />
                    <div />
                    <Field>
                        <FieldLabel htmlFor="transaction-outflow">
                            Outflow
                        </FieldLabel>
                        <NumberInput
                            id="transaction-outflow"
                            min="0"
                            step="0.01"
                            value={outflow}
                            onChange={(event) => setOutflow(event.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="transaction-inflow">
                            Inflow
                        </FieldLabel>
                        <NumberInput
                            id="transaction-inflow"
                            min="0"
                            step="0.01"
                            value={inflow}
                            onChange={(event) => setInflow(event.target.value)}
                        />
                    </Field>
                </div>
                <DialogFooter>
                    <DialogClose
                        render={<Button type="button" variant="outline" />}
                        onClick={onCancel}
                    >
                        Cancel
                    </DialogClose>
                    <DialogClose
                        render={
                            <Button
                                type="button"
                                disabled={!canSave}
                                onClick={save}
                            />
                        }
                    >
                        {entry ? "Save" : "Add"}
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export default AddEditTransactionDialog;
