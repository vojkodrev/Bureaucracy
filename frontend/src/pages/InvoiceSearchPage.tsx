import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function InvoiceSearchPage() {
    return (
        <div className="p-4">
            <form
                className="max-w-2xl"
                onSubmit={(event) => event.preventDefault()}
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
