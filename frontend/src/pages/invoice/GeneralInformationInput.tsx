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
    const invoiceTime = props.invoiceDate
        ? `${String(props.invoiceDate.getHours()).padStart(2, '0')}:${String(props.invoiceDate.getMinutes()).padStart(2, '0')}:${String(props.invoiceDate.getSeconds()).padStart(2, '0')}`
        : ''
    const selectInvoiceDate = (date?: Date) => {
        if (!date) {
            props.onInvoiceDateChange(undefined)
            return
        }
        const time = props.invoiceDate ?? new Date()
        date.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0)
        props.onInvoiceDateChange(date)
    }
    const changeInvoiceTime = (value: string) => {
        if (!value) return
        const [hours, minutes, seconds = '0'] = value.split(':')
        const date = new Date(props.invoiceDate ?? new Date())
        date.setHours(Number(hours), Number(minutes), Number(seconds), 0)
        props.onInvoiceDateChange(date)
    }

    return (
        <Card>
            <CardHeader><CardTitle>General information</CardTitle></CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field><FieldLabel htmlFor="invoice-number">Number</FieldLabel><Input id="invoice-number" value={props.invoiceNumber} onChange={(event) => props.onInvoiceNumberChange(event.target.value)} /></Field>
                        <Field><FieldLabel htmlFor="business-year">Business year</FieldLabel><Input id="business-year" value={props.businessYear ?? ''} readOnly /></Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DatePickerField id="invoice-date" label="Invoice date" name="invoiceDate"
                            date={props.invoiceDate} onSelect={selectInvoiceDate} />
                        <Field>
                            <FieldLabel htmlFor="invoice-time">Invoice time</FieldLabel>
                            <Input id="invoice-time" name="invoiceTime" type="time" step="1"
                                value={invoiceTime} disabled={!props.invoiceDate}
                                onChange={(event) => changeInvoiceTime(event.target.value)} />
                        </Field>
                    </div>
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
