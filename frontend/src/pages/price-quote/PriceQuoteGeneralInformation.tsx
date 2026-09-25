import DatePickerField from '@/components/DatePickerField'
import { RefreshCwIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Props = {
    quoteNumber: string
    businessYear: number | null
    issueDate?: Date
    dueDate?: Date
    onQuoteNumberChange: (value: string) => void
    onIssueDateChange: (date?: Date) => void
    onDueDateChange: (date?: Date) => void
    onRecalculateDueDate: () => void
    canRecalculateDueDate: boolean
    isRecalculatingDueDate?: boolean
}

export default function PriceQuoteGeneralInformation(props: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>General information</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="price-quote-number">Number</FieldLabel>
                            <Input
                                id="price-quote-number"
                                value={props.quoteNumber}
                                onChange={(event) =>
                                    props.onQuoteNumberChange(event.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="price-quote-business-year">
                                Business year
                            </FieldLabel>
                            <Input
                                id="price-quote-business-year"
                                value={props.businessYear ?? ''}
                                readOnly
                            />
                        </Field>
                    </div>
                    <DatePickerField
                        id="price-quote-date"
                        label="Quote date"
                        name="issueDate"
                        date={props.issueDate}
                        onSelect={props.onIssueDateChange}
                    />
                    <DatePickerField
                        id="price-quote-due-date"
                        label="Valid until"
                        name="dueDate"
                        date={props.dueDate}
                        onSelect={props.onDueDateChange}
                        action={{
                            icon: <RefreshCwIcon className={props.isRecalculatingDueDate
                                ? 'animate-spin' : undefined} />,
                            label: 'Recalculate valid until date',
                            disabled: !props.canRecalculateDueDate || props.isRecalculatingDueDate,
                            onClick: props.onRecalculateDueDate,
                        }}
                    />
                </FieldGroup>
            </CardContent>
        </Card>
    )
}
