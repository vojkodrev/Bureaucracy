import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Props = {
    productCode: string
    name: string
    unit: string
    onProductCodeChange: (value: string) => void
    onNameChange: (value: string) => void
    onUnitChange: (value: string) => void
    readOnly?: boolean
}

function ProductDetails({
    productCode,
    name,
    unit,
    onProductCodeChange,
    onNameChange,
    onUnitChange,
    readOnly = false,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product details</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="product-code">Product code</FieldLabel>
                        <Input id="product-code" maxLength={25} required value={productCode} disabled={readOnly}
                            onChange={(event) => onProductCodeChange(event.target.value)} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="product-name">Name</FieldLabel>
                        <Input id="product-name" maxLength={100} required value={name} disabled={readOnly}
                            onChange={(event) => onNameChange(event.target.value)} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="product-unit">Unit</FieldLabel>
                        <Input id="product-unit" maxLength={10} value={unit} disabled={readOnly}
                            onChange={(event) => onUnitChange(event.target.value)} />
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}

export default ProductDetails
