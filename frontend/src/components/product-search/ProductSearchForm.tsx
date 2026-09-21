import type { SubmitEvent, SyntheticEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ProductSearchForm as SearchForm } from './types'

type ProductSearchFormProps = {
    search: SearchForm
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
    onReset: (event: SyntheticEvent<HTMLFormElement>) => void
}

function ProductSearchForm({ search, onSubmit, onReset }: ProductSearchFormProps) {
    return (
        <form className="max-w-2xl" onSubmit={onSubmit} onReset={onReset}>
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
