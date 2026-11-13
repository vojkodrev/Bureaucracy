import DatePickerField from '@/components/DatePickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Props = {
    deliveryNoteNumber: string
    businessYear: number | null
    issueDate?: Date
    deliveryDate?: Date
    withoutAmounts: boolean
    onNumberChange: (value: string) => void
    onIssueDateChange: (date?: Date) => void
    onDeliveryDateChange: (date?: Date) => void
    onWithoutAmountsChange: (value: boolean) => void
}

export default function DeliveryNoteGeneralInformation(props: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General information</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="delivery-note-number">
                                Number
                            </FieldLabel>
                            <Input
                                id="delivery-note-number"
                                value={props.deliveryNoteNumber}
                                onChange={(event) => {
                                    props.onNumberChange(event.target.value)
                                }}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="delivery-note-business-year">
                                Business year
                            </FieldLabel>
                            <Input
                                id="delivery-note-business-year"
                                value={props.businessYear ?? ''}
                                readOnly
                            />
                        </Field>
                    </div>
                    <DatePickerField
                        id="delivery-note-issue-date"
                        label="Issue date"
                        name="issueDate"
                        date={props.issueDate}
                        onSelect={props.onIssueDateChange}
                    />
                    <DatePickerField
                        id="delivery-note-delivery-date"
                        label="Delivery date"
                        name="deliveryDate"
                        date={props.deliveryDate}
                        onSelect={props.onDeliveryDateChange}
                    />
                    <Field orientation="horizontal">
                        <input
                            id="delivery-note-without-amounts"
                            type="checkbox"
                            className="size-4"
                            checked={props.withoutAmounts}
                            onChange={(event) => {
                                props.onWithoutAmountsChange(
                                    event.target.checked,
                                )
                            }}
                        />
                        <FieldLabel htmlFor="delivery-note-without-amounts">
                            Print without amounts
                        </FieldLabel>
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    )
}
