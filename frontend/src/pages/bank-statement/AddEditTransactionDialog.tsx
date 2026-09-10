import { useState } from 'react'
import BankTransactionTypeComboboxField from '@/components/BankTransactionTypeComboboxField'
import CustomerPickerField from '@/components/CustomerPickerField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import type { BankStatementEntry } from '@/lib/bank-statement-types'

type Props = { entry: BankStatementEntry | null; onOpenChange: (open: boolean) => void; onSave: (entry: BankStatementEntry) => void }
const numberOrNull = (value: string) => value.trim() === '' ? null : Number(value)

function AddEditTransactionDialog({ entry, onOpenChange, onSave }: Props) {
    const [counterpartyId, setCounterpartyId] = useState(entry?.customerId ?? '')
    const [counterparty, setCounterparty] = useState(entry?.customerName ?? '')
    const [transactionTypeId, setTransactionTypeId] = useState(entry?.transactionTypeId ?? null)
    const [transactionType, setTransactionType] = useState(entry?.transactionType ?? '')
    const [outflow, setOutflow] = useState(entry?.outflow == null ? '' : String(entry.outflow))
    const [inflow, setInflow] = useState(entry?.inflow == null ? '' : String(entry.inflow))
    const outflowValue = numberOrNull(outflow)
    const inflowValue = numberOrNull(inflow)
    const canSave = transactionTypeId != null && (outflowValue ?? 0) >= 0 && (inflowValue ?? 0) >= 0 && !((outflowValue ?? 0) > 0 && (inflowValue ?? 0) > 0)
    const save = () => onSave({
        id: entry?.id ?? 0, statementId: entry?.statementId ?? 0, statementNumber: entry?.statementNumber ?? null,
        paymentDate: entry?.paymentDate ?? null, customerId: counterpartyId.trim() || null,
        customerName: counterparty.trim() || null, transactionType: transactionType || null,
        transactionTypeId, outflow: outflowValue, inflow: inflowValue,
        documentNumber: entry?.documentNumber ?? null,
    })
    return <Dialog open onOpenChange={onOpenChange}><DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{entry ? 'Edit transaction' : 'Add transaction'}</DialogTitle><DialogDescription>Enter the counterparty, transaction type, and amount.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
            <CustomerPickerField id="transaction-counterparty" label="Counterparty number" name="counterpartyId" customerId={counterpartyId} onCustomerIdChange={setCounterpartyId} onCustomerNameChange={setCounterparty} />
            <Field><FieldLabel htmlFor="transaction-counterparty-name">Counterparty</FieldLabel><Input id="transaction-counterparty-name" value={counterparty} onChange={(event) => setCounterparty(event.target.value)} /></Field>
            <BankTransactionTypeComboboxField id="transaction-type" label="Transaction type" value={transactionTypeId} onChange={(value) => { setTransactionTypeId(value?.code ?? null); setTransactionType(value?.name ?? '') }} />
            <div />
            <Field><FieldLabel htmlFor="transaction-outflow">Outflow</FieldLabel><NumberInput id="transaction-outflow" min="0" step="0.01" value={outflow} onChange={(event) => setOutflow(event.target.value)} /></Field>
            <Field><FieldLabel htmlFor="transaction-inflow">Inflow</FieldLabel><NumberInput id="transaction-inflow" min="0" step="0.01" value={inflow} onChange={(event) => setInflow(event.target.value)} /></Field>
        </div>
        <DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose><DialogClose render={<Button type="button" disabled={!canSave} onClick={save} />}>{entry ? 'Save' : 'Add'}</DialogClose></DialogFooter>
    </DialogContent></Dialog>
}
export default AddEditTransactionDialog
