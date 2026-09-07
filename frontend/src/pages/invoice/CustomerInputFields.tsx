import CustomerPickerField from '@/components/CustomerPickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type CustomerInputFieldsProps = {
    customerId: string
    customerName: string
    customerAddress: string
    customerPostalCode: string
    customerCity: string
    customerCountry: string
    onCustomerIdChange: (value: string) => void
    onCustomerNameChange: (value: string) => void
    onCustomerAddressChange: (value: string) => void
    onCustomerPostalCodeChange: (value: string) => void
    onCustomerCityChange: (value: string) => void
    onCustomerCountryChange: (value: string) => void
}

function CustomerInputFields(props: CustomerInputFieldsProps) {
    return (
        <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent>
                <FieldGroup>
                    <CustomerPickerField
                        id="customer-id" label="ID" name="customerId"
                        customerId={props.customerId}
                        onCustomerIdChange={props.onCustomerIdChange}
                        onCustomerNameChange={props.onCustomerNameChange}
                        onCustomerAddressChange={props.onCustomerAddressChange}
                        onCustomerPostalCodeChange={props.onCustomerPostalCodeChange}
                        onCustomerCityChange={props.onCustomerCityChange}
                        onCustomerCountryChange={props.onCustomerCountryChange}
                    />
                    <Field><FieldLabel htmlFor="customer-name">Name</FieldLabel><Input id="customer-name" value={props.customerName} onChange={(event) => props.onCustomerNameChange(event.target.value)} /></Field>
                    <Field><FieldLabel htmlFor="customer-address">Address</FieldLabel><Input id="customer-address" value={props.customerAddress} onChange={(event) => props.onCustomerAddressChange(event.target.value)} /></Field>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Field><FieldLabel htmlFor="customer-postal-code">Postal code</FieldLabel><Input id="customer-postal-code" value={props.customerPostalCode} onChange={(event) => props.onCustomerPostalCodeChange(event.target.value)} /></Field>
                        <Field><FieldLabel htmlFor="customer-city">City</FieldLabel><Input id="customer-city" value={props.customerCity} onChange={(event) => props.onCustomerCityChange(event.target.value)} /></Field>
                    </div>
                    <Field><FieldLabel htmlFor="customer-country">Country</FieldLabel><Input id="customer-country" value={props.customerCountry} onChange={(event) => props.onCustomerCountryChange(event.target.value)} /></Field>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}

export default CustomerInputFields
