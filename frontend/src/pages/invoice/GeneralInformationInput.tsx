import DatePickerField from '@/components/DatePickerField'
import { RefreshCwIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type GeneralInformationInputProps = {
    invoiceNumber: string
    businessYear: number | null
    invoiceDate?: Date
    dueDate?: Date
    serviceDate?: Date
    purchaseOrderNumber: string
    onInvoiceNumberChange: (value: string) => void
    onInvoiceDateChange: (date?: Date) => void
    onDueDateChange: (date?: Date) => void
    onRecalculateDueDate: () => void
    canRecalculateDueDate: boolean
    isRecalculatingDueDate?: boolean
    onServiceDateChange: (date?: Date) => void
    onPurchaseOrderNumberChange: (value: string) => void
}

function GeneralInformationInput(props: GeneralInformationInputProps) {
    return (
        <Card>
            <CardHeader><CardTitle>General information</CardTitle></CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field><FieldLabel htmlFor="invoice-number">Number</FieldLabel><Input id="invoice-number" value={props.invoiceNumber} onChange={(event) => props.onInvoiceNumberChange(event.target.value)} /></Field>
                        <Field><FieldLabel htmlFor="business-year">Business year</FieldLabel><Input id="business-year" value={props.businessYear ?? ''} readOnly /></Field>
                    </div>
                    <DatePickerField id="invoice-date" label="Invoice date" name="invoiceDate" date={props.invoiceDate} onSelect={props.onInvoiceDateChange} />
                    <DatePickerField id="due-date" label="Due date" name="dueDate" date={props.dueDate}
                        onSelect={props.onDueDateChange}
                        action={{
                            icon: <RefreshCwIcon className={props.isRecalculatingDueDate ? 'animate-spin' : undefined} />,
                            label: 'Recalculate due date',
                            disabled: !props.canRecalculateDueDate || props.isRecalculatingDueDate,
                            onClick: props.onRecalculateDueDate,
                        }} />
                    <DatePickerField id="service-date" label="Service date" name="serviceDate" date={props.serviceDate} onSelect={props.onServiceDateChange} />
                    <Field>
                        <FieldLabel htmlFor="purchase-order-number">Purchase order number</FieldLabel>
                        <Input id="purchase-order-number" name="purchaseOrderNumber"
                            value={props.purchaseOrderNumber}
                            onChange={(event) => props.onPurchaseOrderNumberChange(event.target.value)} />
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}

export default GeneralInformationInput
