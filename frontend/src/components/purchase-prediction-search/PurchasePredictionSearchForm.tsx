import { useState } from 'react'
import type { FormEvent, SubmitEvent } from 'react'
import CustomerPickerField from '@/components/customer-search/CustomerPickerField'
import ProductPickerField from '@/components/product-search/ProductPickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { defaultPage } from '@/lib/pagination'
import type { PurchasePredictionSearchCriteria } from './types'

type Props = {
    search: PurchasePredictionSearchCriteria
    onSubmit: (search: PurchasePredictionSearchCriteria) => void
    onReset: () => void
}

export default function PurchasePredictionSearchForm({
    search,
    onSubmit,
    onReset,
}: Props) {
    const [customerCode, setCustomerCode] = useState(search.customerCode)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [productCode, setProductCode] = useState(search.productCode)
    const [productName, setProductName] = useState(search.productName)

    function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onSubmit({
            customerCode: String(data.get('customerCode') ?? '').trim(),
            customerName: String(data.get('customerName') ?? '').trim(),
            productCode: String(data.get('productCode') ?? '').trim(),
            productName: String(data.get('productName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: search.pageSize,
        })
    }

    function reset(_event: FormEvent<HTMLFormElement>) {
        setCustomerCode('')
        setCustomerName('')
        setProductCode('')
        setProductName('')
        onReset()
    }

    return (
        <form className="max-w-4xl" onSubmit={submit} onReset={reset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <CustomerPickerField
                                id="prediction-customer-code"
                                label="Customer ID"
                                name="customerCode"
                                customerId={customerCode}
                                onCustomerIdChange={setCustomerCode}
                                onCustomerNameChange={setCustomerName}
                            />
                            <Field>
                                <FieldLabel htmlFor="prediction-customer-name">
                                    Customer name
                                </FieldLabel>
                                <Input
                                    id="prediction-customer-name"
                                    name="customerName"
                                    type="search"
                                    value={customerName}
                                    autoComplete="off"
                                    onChange={(event) => setCustomerName(event.target.value)}
                                />
                            </Field>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <ProductPickerField
                                id="prediction-product-code"
                                label="Product code"
                                name="productCode"
                                productCode={productCode}
                                onProductCodeChange={setProductCode}
                                onProductNameChange={setProductName}
                            />
                            <Field>
                                <FieldLabel htmlFor="prediction-product-name">
                                    Product name
                                </FieldLabel>
                                <Input
                                    id="prediction-product-name"
                                    name="productName"
                                    type="search"
                                    value={productName}
                                    autoComplete="off"
                                    onChange={(event) => setProductName(event.target.value)}
                                />
                            </Field>
                        </div>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button type="reset" variant="outline">Clear</Button>
                    <Button type="submit">Search</Button>
                </CardFooter>
            </Card>
        </form>
    )
}
