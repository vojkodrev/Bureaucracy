import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import ProductPickerField from '@/components/ProductPickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { dateFromSearchValue } from '@/lib/dates'
import type { InvoiceResultsView, InvoiceSearchCriteria, PaymentStatus } from './types'
import { invoiceResultsViews, paymentStatuses } from './types'

type InvoiceSearchFormProps = {
    search: InvoiceSearchCriteria
    showResultsView: boolean
    onSubmit: (search: InvoiceSearchCriteria) => void
    onReset: () => void
}

function InvoiceSearchForm({
    search,
    showResultsView,
    onSubmit,
    onReset,
}: InvoiceSearchFormProps) {
    const [customerId, setCustomerId] = useState(search.customerId)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [productCode, setProductCode] = useState(search.productCode)
    const [productName, setProductName] = useState(search.productName)
    const [invoiceDateFrom, setInvoiceDateFrom] = useState(() =>
        dateFromSearchValue(search.from),
    )
    const [invoiceDateTo, setInvoiceDateTo] = useState(() =>
        dateFromSearchValue(search.to),
    )

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const paymentStatus = formData.get('paymentStatus') as PaymentStatus
        const resultsView = formData.get('resultsView') as InvoiceResultsView

        onSubmit({
            invoiceNumber: String(formData.get('invoiceNumber') ?? '').trim(),
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            productCode: String(formData.get('productCode') ?? '').trim(),
            productName: String(formData.get('productName') ?? '').trim(),
            from: String(formData.get('from') ?? ''),
            to: String(formData.get('to') ?? ''),
            paymentStatus: paymentStatuses.includes(paymentStatus) ? paymentStatus : 'all',
            resultsView: invoiceResultsViews.includes(resultsView) ? resultsView : 'invoiceList',
            page: '1',
            pageSize: search.pageSize,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
        })
    }

    return (
        <form className="max-w-6xl" onSubmit={submitSearch} onReset={onReset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="invoice-number">Invoice number</FieldLabel>
                                    <Input
                                        id="invoice-number"
                                        type="search"
                                        name="invoiceNumber"
                                        defaultValue={search.invoiceNumber}
                                        autoComplete="off"
                                    />
                                </Field>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <DatePickerField
                                        id="invoice-date-from"
                                        label="Invoice date from"
                                        name="from"
                                        date={invoiceDateFrom}
                                        onSelect={setInvoiceDateFrom}
                                    />
                                    <DatePickerField
                                        id="invoice-date-to"
                                        label="Invoice date to"
                                        name="to"
                                        date={invoiceDateTo}
                                        onSelect={setInvoiceDateTo}
                                    />
                                </div>
                            </FieldGroup>

                            <FieldGroup>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <CustomerPickerField
                                        id="customer-id"
                                        label="Customer ID"
                                        name="customerId"
                                        customerId={customerId}
                                        onCustomerIdChange={setCustomerId}
                                        onCustomerNameChange={setCustomerName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="customer-name">Customer name</FieldLabel>
                                        <Input
                                            id="customer-name"
                                            type="search"
                                            name="customerName"
                                            value={customerName}
                                            autoComplete="off"
                                            onChange={(event) => setCustomerName(event.target.value)}
                                        />
                                    </Field>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <ProductPickerField
                                        id="product-code"
                                        label="Product code"
                                        name="productCode"
                                        productCode={productCode}
                                        onProductCodeChange={setProductCode}
                                        onProductNameChange={setProductName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="product-name">Product name</FieldLabel>
                                        <Input
                                            id="product-name"
                                            type="search"
                                            name="productName"
                                            value={productName}
                                            autoComplete="off"
                                            onChange={(event) => setProductName(event.target.value)}
                                        />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </div>

                        <FieldSet>
                            <FieldLegend variant="label">Show invoices</FieldLegend>
                            <RadioGroup
                                name="paymentStatus"
                                defaultValue={search.paymentStatus}
                                className="flex flex-wrap gap-4"
                            >
                                {([
                                    ['all', 'All'],
                                    ['overdue', 'Overdue'],
                                    ['paid', 'Paid'],
                                    ['unpaid', 'Unpaid'],
                                ] as const).map(([value, label]) => (
                                    <Field key={value} orientation="horizontal" className="w-auto">
                                        <RadioGroupItem id={`payment-status-${value}`} value={value} />
                                        <FieldLabel htmlFor={`payment-status-${value}`}>{label}</FieldLabel>
                                    </Field>
                                ))}
                            </RadioGroup>
                        </FieldSet>

                        {showResultsView && (
                            <FieldSet>
                                <FieldLegend variant="label">Results view</FieldLegend>
                                <RadioGroup
                                    name="resultsView"
                                    defaultValue={search.resultsView}
                                    className="flex flex-wrap gap-4"
                                >
                                    {([
                                        ['invoiceList', 'Invoice list'],
                                        ['customer', 'By customer'],
                                    ] as const).map(([value, label]) => (
                                        <Field key={value} orientation="horizontal" className="w-auto">
                                            <RadioGroupItem id={`results-view-${value}`} value={value} />
                                            <FieldLabel htmlFor={`results-view-${value}`}>{label}</FieldLabel>
                                        </Field>
                                    ))}
                                </RadioGroup>
                            </FieldSet>
                        )}
                    </FieldGroup>
                </CardContent>
                <CardFooter className="gap-2">
                    <Button type="submit">Search</Button>
                    <Button type="reset" variant="outline">Clear</Button>
                </CardFooter>
            </Card>
        </form>
    )
}

export default InvoiceSearchForm
