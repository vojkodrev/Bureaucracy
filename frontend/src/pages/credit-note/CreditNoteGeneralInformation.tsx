import DatePickerField from '@/components/DatePickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type Props = {
    number: string
    businessYear: number | null
    issueDate?: Date
    serviceDate?: Date
    dueDate?: Date
    onNumberChange: (value: string) => void
    onIssueDateChange: (date?: Date) => void
    onServiceDateChange: (date?: Date) => void
    onDueDateChange: (date?: Date) => void
}

export default function CreditNoteGeneralInformation(props: Props) {
    return (
        <Card>
            <CardHeader><CardTitle>General information</CardTitle></CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="credit-note-number">Number</FieldLabel>
                            <Input
                                id="credit-note-number"
                                value={props.number}
                                onChange={(event) => props.onNumberChange(event.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="credit-note-business-year">
                                Business year
                            </FieldLabel>
                            <Input
                                id="credit-note-business-year"
                                value={props.businessYear ?? ''}
                                readOnly
                            />
                        </Field>
                    </div>
                    <DatePickerField
                        id="credit-note-issue-date"
                        label="Credit note date"
                        name="issueDate"
                        date={props.issueDate}
                        onSelect={props.onIssueDateChange}
                    />
                    <DatePickerField
                        id="credit-note-service-date"
                        label="Service date"
                        name="serviceDate"
                        date={props.serviceDate}
                        onSelect={props.onServiceDateChange}
                    />
                    <DatePickerField
                        id="credit-note-due-date"
                        label="Due date"
                        name="dueDate"
                        date={props.dueDate}
                        onSelect={props.onDueDateChange}
                    />
                </FieldGroup>
            </CardContent>
        </Card>
    )
}
