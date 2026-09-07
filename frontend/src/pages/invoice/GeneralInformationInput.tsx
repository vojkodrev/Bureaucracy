import DatePickerField from '@/components/DatePickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type GeneralInformationInputProps = {
    invoiceNumber: string
    businessYearDescription: string
    invoiceDate?: Date
    paymentDate?: Date
    serviceDate?: Date
    onInvoiceNumberChange: (value: string) => void
    onInvoiceDateChange: (date?: Date) => void
    onPaymentDateChange: (date?: Date) => void
    onServiceDateChange: (date?: Date) => void
}

function GeneralInformationInput(props: GeneralInformationInputProps) {
    return (
        <Card>
            <CardHeader><CardTitle>General information</CardTitle></CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field><FieldLabel htmlFor="invoice-number">Number</FieldLabel><Input id="invoice-number" value={props.invoiceNumber} onChange={(event) => props.onInvoiceNumberChange(event.target.value)} /></Field>
                        <Field><FieldLabel htmlFor="business-year">Business year</FieldLabel><Input id="business-year" value={props.businessYearDescription} readOnly /></Field>
                    </div>
                    <DatePickerField id="invoice-date" label="Date" name="invoiceDate" date={props.invoiceDate} onSelect={props.onInvoiceDateChange} />
                    <DatePickerField id="payment-date" label="Payment date" name="paymentDate" date={props.paymentDate} onSelect={props.onPaymentDateChange} />
                    <DatePickerField id="service-date" label="Service date" name="serviceDate" date={props.serviceDate} onSelect={props.onServiceDateChange} />
                </FieldGroup>
            </CardContent>
        </Card>
    )
}

export default GeneralInformationInput
