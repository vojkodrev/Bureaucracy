import { useState } from 'react'
import DatePickerField from '@/components/DatePickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function InvoiceSearchPage() {
    const [invoiceDateFrom, setInvoiceDateFrom] = useState<Date>()
    const [invoiceDateTo, setInvoiceDateTo] = useState<Date>()

    return (
        <div className="p-4">
            <form
                className="max-w-2xl"
                onSubmit={(event) => event.preventDefault()}
                onReset={() => {
                    setInvoiceDateFrom(undefined)
                    setInvoiceDateTo(undefined)
                }}
            >
                <Card>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="invoice-number">
                                    Invoice number
                                </FieldLabel>
                                <Input
                                    id="invoice-number"
                                    name="invoiceNumber"
                                    autoComplete="off"
                                />
                            </Field>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="customer-id">
                                        Customer ID
                                    </FieldLabel>
                                    <Input
                                        id="customer-id"
                                        name="customerId"
                                        autoComplete="off"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="customer-name">
                                        Customer name
                                    </FieldLabel>
                                    <Input
                                        id="customer-name"
                                        name="customerName"
                                        autoComplete="off"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <DatePickerField
                                    id="invoice-date-from"
                                    label="Invoice date from"
                                    name="invoiceDateFrom"
                                    date={invoiceDateFrom}
                                    onSelect={setInvoiceDateFrom}
                                />
                                <DatePickerField
                                    id="invoice-date-to"
                                    label="Invoice date to"
                                    name="invoiceDateTo"
                                    date={invoiceDateTo}
                                    onSelect={setInvoiceDateTo}
                                />
                            </div>

                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit">Search</Button>
                        <Button type="reset" variant="outline">
                            Clear
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}

export default InvoiceSearchPage
