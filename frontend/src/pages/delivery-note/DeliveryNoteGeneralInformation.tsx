import { RefreshCwIcon } from 'lucide-react'
import DatePickerField from '@/components/DatePickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group'

type Props = {
    deliveryNoteNumber: string
    businessYear: number | null
    issueDate?: Date
    deliveryDate?: Date
    withoutAmounts: boolean
    onNumberChange: (value: string) => void
    onRefreshNumber: () => void
    canRefreshNumber: boolean
    isRefreshingNumber: boolean
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
                            <InputGroup>
                                <InputGroupInput
                                    id="delivery-note-number"
                                    value={props.deliveryNoteNumber}
                                    onChange={(event) => {
                                        props.onNumberChange(event.target.value)
                                    }}
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        size="icon-xs"
                                        aria-label="Get next delivery note number"
                                        title="Get next delivery note number"
                                        disabled={!props.canRefreshNumber}
                                        onClick={props.onRefreshNumber}
                                    >
                                        <RefreshCwIcon className={props.isRefreshingNumber ? 'animate-spin' : undefined} />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
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
                        action={{
                            icon: <RefreshCwIcon />,
                            label: 'Set issue date to today',
                            onClick: () => props.onIssueDateChange(new Date()),
                        }}
                    />
                    <DatePickerField
                        id="delivery-note-delivery-date"
                        label="Delivery date"
                        name="deliveryDate"
                        date={props.deliveryDate}
                        onSelect={props.onDeliveryDateChange}
                        action={{
                            icon: <RefreshCwIcon />,
                            label: 'Set delivery date to today',
                            onClick: () => props.onDeliveryDateChange(new Date()),
                        }}
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
