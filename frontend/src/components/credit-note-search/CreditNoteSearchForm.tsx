import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CustomerPickerField from '@/components/customer-search/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import InvoicePickerField from '@/components/invoice-search/InvoicePickerField'
import ProductPickerField from '@/components/product-search/ProductPickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { dateFromSearchValue } from '@/lib/dates'
import type { CreditNoteSearchCriteria } from './types'

type Props = {
    search: CreditNoteSearchCriteria
    onSubmit: (search: CreditNoteSearchCriteria) => void
    onReset: () => void
}

export default function CreditNoteSearchForm({ search, onSubmit, onReset }: Props) {
    const [customerId, setCustomerId] = useState(search.customerId)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [productCode, setProductCode] = useState(search.productCode)
    const [productName, setProductName] = useState(search.productName)
    const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState(
        search.originalInvoiceNumber,
    )
    const [from, setFrom] = useState(() => dateFromSearchValue(search.from))
    const [to, setTo] = useState(() => dateFromSearchValue(search.to))

    function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const value = (name: string) => String(data.get(name) ?? '').trim()
        onSubmit({
            ...search,
            creditNoteNumber: value('creditNoteNumber'),
            customerId: value('customerId'),
            customerName: value('customerName'),
            productCode: value('productCode'),
            productName: value('productName'),
            originalInvoiceNumber: value('originalInvoiceNumber'),
            from: value('from'),
            to: value('to'),
            page: '1',
        })
    }

    return (
        <form className="max-w-6xl" onSubmit={submit} onReset={onReset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="credit-note-number">
                                        Credit note number
                                    </FieldLabel>
                                    <Input
                                        id="credit-note-number"
                                        type="search"
                                        name="creditNoteNumber"
                                        defaultValue={search.creditNoteNumber}
                                        autoComplete="off"
                                    />
                                </Field>
                                <InvoicePickerField
                                    id="credit-note-original-invoice"
                                    label="Original invoice number"
                                    name="originalInvoiceNumber"
                                    invoiceNumber={originalInvoiceNumber}
                                    onInvoiceNumberChange={setOriginalInvoiceNumber}
                                />
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <DatePickerField
                                        id="credit-note-date-from"
                                        label="Credit note date from"
                                        name="from"
                                        date={from}
                                        onSelect={setFrom}
                                    />
                                    <DatePickerField
                                        id="credit-note-date-to"
                                        label="Credit note date to"
                                        name="to"
                                        date={to}
                                        onSelect={setTo}
                                    />
                                </div>
                            </FieldGroup>
                            <FieldGroup>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <CustomerPickerField
                                        id="credit-note-customer-id"
                                        label="Customer ID"
                                        name="customerId"
                                        customerId={customerId}
                                        onCustomerIdChange={setCustomerId}
                                        onCustomerNameChange={setCustomerName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="credit-note-customer-name">
                                            Customer name
                                        </FieldLabel>
                                        <Input
                                            id="credit-note-customer-name"
                                            type="search"
                                            name="customerName"
                                            value={customerName}
                                            autoComplete="off"
                                            onChange={(event) =>
                                                setCustomerName(event.target.value)}
                                        />
                                    </Field>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <ProductPickerField
                                        id="credit-note-product-code"
                                        label="Product code"
                                        name="productCode"
                                        productCode={productCode}
                                        onProductCodeChange={setProductCode}
                                        onProductNameChange={setProductName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="credit-note-product-name">
                                            Product name
                                        </FieldLabel>
                                        <Input
                                            id="credit-note-product-name"
                                            type="search"
                                            name="productName"
                                            value={productName}
                                            autoComplete="off"
                                            onChange={(event) =>
                                                setProductName(event.target.value)}
                                        />
                                    </Field>
                                </div>
                            </FieldGroup>
                        </div>
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
