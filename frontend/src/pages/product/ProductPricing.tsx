import TaxCodeComboboxField from '@/components/TaxCodeComboboxField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { NumberInput } from '@/components/ui/number-input'

type Props = {
    netPrice: string
    grossPrice: string
    taxRate: string
    taxCode: string
    onNetPriceChange: (value: string) => void
    onTaxChange: (code: string, rate: number | null) => void
}

function ProductPricing({
    netPrice,
    grossPrice,
    taxRate,
    taxCode,
    onNetPriceChange,
    onTaxChange,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="product-net-price">Net price</FieldLabel>
                        <NumberInput id="product-net-price" min="0" step="0.01" value={netPrice}
                            onChange={(event) => onNetPriceChange(event.target.value)} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="product-gross-price">Gross price</FieldLabel>
                        <NumberInput id="product-gross-price" min="0" step="0.01" value={grossPrice} disabled />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <TaxCodeComboboxField id="product-tax-code" label="Tax code" value={taxCode}
                            onChange={onTaxChange} />
                        <Field>
                            <FieldLabel htmlFor="product-tax-rate">Tax rate</FieldLabel>
                            <NumberInput id="product-tax-rate" min="0" step="0.01" value={taxRate} disabled />
                        </Field>
                    </div>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}

export default ProductPricing
