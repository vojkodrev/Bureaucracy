import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import ProductPickerField from '@/components/ProductPickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { dateFromSearchValue } from '@/lib/dates'
import type { PriceQuoteSearchCriteria } from './types'

type Props = {
    search: PriceQuoteSearchCriteria
    onSubmit: (search: PriceQuoteSearchCriteria) => void
    onReset: () => void
}

export default function PriceQuoteSearchForm({ search, onSubmit, onReset }: Props) {
    const [customerId, setCustomerId] = useState(search.customerId)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [productCode, setProductCode] = useState(search.productCode)
    const [productName, setProductName] = useState(search.productName)
    const [from, setFrom] = useState(() => dateFromSearchValue(search.from))
    const [to, setTo] = useState(() => dateFromSearchValue(search.to))
    function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onSubmit({
            ...search,
            quoteNumber: String(data.get('quoteNumber') ?? '').trim(),
            customerId: String(data.get('customerId') ?? '').trim(),
            customerName: String(data.get('customerName') ?? '').trim(),
            productCode: String(data.get('productCode') ?? '').trim(),
            productName: String(data.get('productName') ?? '').trim(),
            from: String(data.get('from') ?? ''),
            to: String(data.get('to') ?? ''),
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
                                    <FieldLabel htmlFor="quote-number">
                                        Quote number
                                    </FieldLabel>
                                    <Input
                                        id="quote-number"
                                        type="search"
                                        name="quoteNumber"
                                        defaultValue={search.quoteNumber}
                                        autoComplete="off"
                                    />
                                </Field>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <DatePickerField
                                        id="quote-date-from"
                                        label="Quote date from"
                                        name="from"
                                        date={from}
                                        onSelect={setFrom}
                                    />
                                    <DatePickerField
                                        id="quote-date-to"
                                        label="Quote date to"
                                        name="to"
                                        date={to}
                                        onSelect={setTo}
                                    />
                                </div>
                            </FieldGroup>
                            <FieldGroup>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <CustomerPickerField
                                        id="quote-customer-id"
                                        label="Customer ID"
                                        name="customerId"
                                        customerId={customerId}
                                        onCustomerIdChange={setCustomerId}
                                        onCustomerNameChange={setCustomerName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="quote-customer-name">
                                            Customer name
                                        </FieldLabel>
                                        <Input
                                            id="quote-customer-name"
                                            type="search"
                                            name="customerName"
                                            value={customerName}
                                            autoComplete="off"
                                            onChange={(event) =>
                                                setCustomerName(event.target.value)
                                            }
                                        />
                                    </Field>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <ProductPickerField
                                        id="quote-product-code"
                                        label="Product code"
                                        name="productCode"
                                        productCode={productCode}
                                        onProductCodeChange={setProductCode}
                                        onProductNameChange={setProductName}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="quote-product-name">
                                            Product name
                                        </FieldLabel>
                                        <Input
                                            id="quote-product-name"
                                            type="search"
                                            name="productName"
                                            value={productName}
                                            autoComplete="off"
                                            onChange={(event) =>
                                                setProductName(event.target.value)
                                            }
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
