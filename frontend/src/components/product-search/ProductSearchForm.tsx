import type { SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ProductSearchForm as SearchForm } from './types'

type ProductSearchFormProps = {
    search: SearchForm
    onSubmit: (search: SearchForm) => void
    onReset: () => void
}

function ProductSearchForm({ search, onSubmit, onReset }: ProductSearchFormProps) {
    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
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
                                <FieldLabel htmlFor="product-code">Product code</FieldLabel>
                                <Input
                                    id="product-code"
                                    type="search"
                                    name="productCode"
                                    defaultValue={search.productCode}
                                    autoComplete="off"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-name">Product name</FieldLabel>
                                <Input
                                    id="product-name"
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

export default ProductSearchForm
