import type { SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { InventoryItemSearchCriteria } from './types'

type Props = {
    search: InventoryItemSearchCriteria
    onSubmit: (search: InventoryItemSearchCriteria) => void
    onReset: () => void
}

export default function InventoryItemSearchForm({ search, onSubmit, onReset }: Props) {
    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        onSubmit({
            productCode: String(formData.get('productCode') ?? '').trim(),
            productName: String(formData.get('productName') ?? '').trim(),
            page: '1',
            pageSize: search.pageSize,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
        })
    }

    return (
        <form className="max-w-2xl" onSubmit={submitSearch} onReset={onReset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="inventory-product-code">Product code</FieldLabel>
                                <Input
                                    id="inventory-product-code"
                                    type="search"
                                    name="productCode"
                                    defaultValue={search.productCode}
                                    autoComplete="off"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="inventory-product-name">Name</FieldLabel>
                                <Input
                                    id="inventory-product-name"
                                    type="search"
                                    name="productName"
                                    defaultValue={search.productName}
                                    autoComplete="off"
                                />
                            </Field>
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
