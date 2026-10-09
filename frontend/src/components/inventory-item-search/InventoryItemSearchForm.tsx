import type { SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { InventoryItemSearchCriteria } from './types'

type Props = {
    search: InventoryItemSearchCriteria
    onSubmit: (search: InventoryItemSearchCriteria) => void
    onReset: () => void
    showResultsView: boolean
}

export default function InventoryItemSearchForm({ search, onSubmit, onReset, showResultsView }: Props) {
    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        onSubmit({
            productCode: String(formData.get('productCode') ?? '').trim(),
            productName: String(formData.get('productName') ?? '').trim(),
            resultsView: formData.get('resultsView') === 'lowStock' ? 'lowStock' : 'itemList',
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
                        {showResultsView && (
                            <FieldSet>
                                <FieldLegend variant="label">Results view</FieldLegend>
                                <RadioGroup
                                    name="resultsView"
                                    defaultValue={search.resultsView}
                                    className="flex flex-wrap gap-4"
                                >
                                    <Field orientation="horizontal" className="w-auto">
                                        <RadioGroupItem id="inventory-results-item-list" value="itemList" />
                                        <FieldLabel htmlFor="inventory-results-item-list">Inventory item list</FieldLabel>
                                    </Field>
                                    <Field orientation="horizontal" className="w-auto">
                                        <RadioGroupItem id="inventory-results-low-stock" value="lowStock" />
                                        <FieldLabel htmlFor="inventory-results-low-stock">Low-stock items</FieldLabel>
                                    </Field>
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
