import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DatePickerField from '@/components/DatePickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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

            <div className="mt-8">
                <div className="mb-2 flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                        1 of 6
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                    >
                        <ChevronRight />
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Invoice date</TableHead>
                            <TableHead>Due date</TableHead>
                            <TableHead>Payment date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">
                                INV-2026-0012
                            </TableCell>
                            <TableCell>Acme d.o.o.</TableCell>
                            <TableCell className="text-right">
                                €1,240.00
                            </TableCell>
                            <TableCell>Aug 1, 2026</TableCell>
                            <TableCell>Aug 31, 2026</TableCell>
                            <TableCell>Aug 28, 2026</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">
                                INV-2026-0013
                            </TableCell>
                            <TableCell>Northstar Ltd.</TableCell>
                            <TableCell className="text-right">
                                €875.50
                            </TableCell>
                            <TableCell>Aug 5, 2026</TableCell>
                            <TableCell>Sep 4, 2026</TableCell>
                            <TableCell>—</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">
                                INV-2026-0014
                            </TableCell>
                            <TableCell>Studio Triglav</TableCell>
                            <TableCell className="text-right">
                                €2,310.75
                            </TableCell>
                            <TableCell>Aug 12, 2026</TableCell>
                            <TableCell>Sep 11, 2026</TableCell>
                            <TableCell>Sep 1, 2026</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">
                                INV-2026-0015
                            </TableCell>
                            <TableCell>Alpine Systems</TableCell>
                            <TableCell className="text-right">
                                €490.00
                            </TableCell>
                            <TableCell>Aug 18, 2026</TableCell>
                            <TableCell>Sep 17, 2026</TableCell>
                            <TableCell>—</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div className="mt-8 max-w-sm">
                <h2 className="mb-2 text-sm font-medium">Summary</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total amount</TableCell>
                            <TableCell className="text-right font-medium">
                                €4,916.25
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Unpaid</TableCell>
                            <TableCell className="text-right font-medium">
                                €1,365.50
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Past due</TableCell>
                            <TableCell className="text-right font-medium">
                                €0.00
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Paid</TableCell>
                            <TableCell className="text-right font-medium">
                                €3,550.75
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default InvoiceSearchPage
