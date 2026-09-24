import type { Dispatch, FormEventHandler, SetStateAction } from 'react'
import BankAccountComboboxField from '@/components/BankAccountComboboxField'
import CustomerPickerField from '@/components/customer-search/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import type { BankStatementSearchCriteria } from './types'

type DateValue = Parameters<typeof DatePickerField>[0]['date']

type BankStatementSearchFormProps = {
    search: BankStatementSearchCriteria
    bankAccount: string
    customerId: string
    customerName: string
    dateFrom: DateValue
    dateTo: DateValue
    onBankAccountChange: Dispatch<SetStateAction<string>>
    onCustomerIdChange: Dispatch<SetStateAction<string>>
    onCustomerNameChange: Dispatch<SetStateAction<string>>
    onDateFromChange: Dispatch<SetStateAction<DateValue>>
    onDateToChange: Dispatch<SetStateAction<DateValue>>
    onSubmit: FormEventHandler<HTMLFormElement>
    onReset: FormEventHandler<HTMLFormElement>
}

function BankStatementSearchForm({
    search,
    bankAccount,
    customerId,
    customerName,
    dateFrom,
    dateTo,
    onBankAccountChange,
    onCustomerIdChange,
    onCustomerNameChange,
    onDateFromChange,
    onDateToChange,
    onSubmit,
    onReset,
}: BankStatementSearchFormProps) {
    return (
        <form className="max-w-4xl" onSubmit={onSubmit} onReset={onReset}>
            <Card>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="statement-number">Statement number</FieldLabel>
                                <NumberInput
                                    id="statement-number"
                                    min="0"
                                    name="statementNumber"
                                    defaultValue={search.statementNumber}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="document-number">Document number</FieldLabel>
                                <Input
                                    id="document-number"
                                    type="search"
                                    name="documentNumber"
                                    defaultValue={search.documentNumber}
                                    autoComplete="off"
                                />
                            </Field>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <BankAccountComboboxField
                                id="bank-account"
                                label="Bank account"
                                value={bankAccount}
                                onChange={onBankAccountChange}
                            />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <DatePickerField
                                id="statement-date-from"
                                label="Payment date from"
                                name="from"
                                date={dateFrom}
                                onSelect={onDateFromChange}
                            />
                            <DatePickerField
                                id="statement-date-to"
                                label="Payment date to"
                                name="to"
                                date={dateTo}
                                onSelect={onDateToChange}
                            />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <CustomerPickerField
                                id="statement-customer-id"
                                label="Counterparty number"
                                name="customerId"
                                customerId={customerId}
                                onCustomerIdChange={onCustomerIdChange}
                                onCustomerNameChange={onCustomerNameChange}
                            />
                            <Field>
                                <FieldLabel htmlFor="statement-customer-name">
                                    Counterparty
                                </FieldLabel>
                                <Input
                                    id="statement-customer-name"
                                    type="search"
                                    name="customerName"
                                    value={customerName}
                                    autoComplete="off"
                                    onChange={(event) => onCustomerNameChange(event.target.value)}
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

export default BankStatementSearchForm
