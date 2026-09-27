import { useState } from 'react'
import type { SubmitEvent } from 'react'
import DatePickerField from '@/components/DatePickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { dateFromSearchValue } from '@/lib/dates'
import type { GoodsReceiptSearchCriteria } from './types'

type Props = {
    search: GoodsReceiptSearchCriteria
    onSubmit: (search: GoodsReceiptSearchCriteria) => void
    onReset: () => void
}

export default function GoodsReceiptSearchForm({ search, onSubmit, onReset }: Props) {
    const [dateFrom, setDateFrom] = useState(() => dateFromSearchValue(search.from))
    const [dateTo, setDateTo] = useState(() => dateFromSearchValue(search.to))

    function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        onSubmit({
            ...search,
            from: String(form.get('from') ?? ''),
            to: String(form.get('to') ?? ''),
            productCode: String(form.get('productCode') ?? '').trim(),
            productName: String(form.get('productName') ?? '').trim(),
            page: '1',
        })
    }

    return (
        <form className="max-w-6xl" onSubmit={submit} onReset={onReset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid max-w-2xl gap-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <DatePickerField
                                    id="goods-receipt-date-from"
                                    label="Goods receipt date from"
                                    name="from"
                                    date={dateFrom}
                                    onSelect={setDateFrom}
                                />
                                <DatePickerField
                                    id="goods-receipt-date-to"
                                    label="Goods receipt date to"
                                    name="to"
                                    date={dateTo}
                                    onSelect={setDateTo}
                                />
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="product-code">
                                        Product code
                                    </FieldLabel>
                                    <Input
                                        id="product-code"
                                        type="search"
                                        name="productCode"
                                        defaultValue={search.productCode}
                                        autoComplete="off"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="product-name">
                                        Product name
                                    </FieldLabel>
                                    <Input
                                        id="product-name"
                                        type="search"
                                        name="productName"
                                        defaultValue={search.productName}
                                        autoComplete="off"
                                    />
                                </Field>
                            </div>
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
