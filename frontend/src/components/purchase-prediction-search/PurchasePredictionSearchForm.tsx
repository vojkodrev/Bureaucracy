import type { FormEvent, SubmitEvent } from 'react'
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
        onReset()
    }

    return (
        <form className="max-w-4xl" onSubmit={submit} onReset={reset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="prediction-customer-code">
                                    Customer ID
                                </FieldLabel>
                                <Input
                                    id="prediction-customer-code"
                                    name="customerCode"
                                    type="search"
                                    defaultValue={search.customerCode}
                                    autoComplete="off"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="prediction-customer-name">
                                    Customer name
                                </FieldLabel>
                                <Input
                                    id="prediction-customer-name"
                                    name="customerName"
                                    type="search"
                                    defaultValue={search.customerName}
                                    autoComplete="off"
                                />
                            </Field>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="prediction-product-code">
                                    Product code
                                </FieldLabel>
                                <Input
                                    id="prediction-product-code"
                                    name="productCode"
                                    type="search"
                                    defaultValue={search.productCode}
                                    autoComplete="off"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="prediction-product-name">
                                    Product name
                                </FieldLabel>
                                <Input
                                    id="prediction-product-name"
                                    name="productName"
                                    type="search"
                                    defaultValue={search.productName}
                                    autoComplete="off"
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
