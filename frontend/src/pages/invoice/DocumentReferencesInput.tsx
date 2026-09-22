import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type DocumentReferencesInputProps = {
    purchaseOrderNumber: string
    deliveryNoteNumber: string
    onPurchaseOrderNumberChange: (value: string) => void
    onDeliveryNoteNumberChange: (value: string) => void
}

function DocumentReferencesInput(props: DocumentReferencesInputProps) {
    return <Card>
        <CardHeader><CardTitle>Document references</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field>
                <FieldLabel htmlFor="purchase-order-number">Purchase order number</FieldLabel>
                <Input id="purchase-order-number" name="purchaseOrderNumber"
                    value={props.purchaseOrderNumber}
                    onChange={(event) => props.onPurchaseOrderNumberChange(event.target.value)} />
            </Field>
            <Field>
                <FieldLabel htmlFor="delivery-note-number">Delivery note number</FieldLabel>
                <Input id="delivery-note-number" name="deliveryNoteNumber"
                    value={props.deliveryNoteNumber}
                    onChange={(event) => props.onDeliveryNoteNumberChange(event.target.value)} />
            </Field>
        </CardContent>
    </Card>
}

export default DocumentReferencesInput
