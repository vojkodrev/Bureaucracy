import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function InvoiceSearchPage() {
    return (
        <div className="p-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Invoice search</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <form
                className="mt-8 max-w-2xl"
                onSubmit={(event) => event.preventDefault()}
            >
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

                    <Field orientation="horizontal">
                        <Button type="submit">Search</Button>
                        <Button type="reset" variant="outline">
                            Clear
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    )
}

export default InvoiceSearchPage
