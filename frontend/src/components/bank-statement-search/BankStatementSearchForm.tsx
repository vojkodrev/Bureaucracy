import { useState } from 'react'
import type { FormEvent, SubmitEvent } from 'react'
import BankAccountComboboxField from '@/components/BankAccountComboboxField'
import CustomerPickerField from '@/components/customer-search/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { dateFromSearchValue } from '@/lib/dates'
import { defaultPage } from '@/lib/pagination'
import type { BankStatementSearchCriteria } from './types'

type BankStatementSearchFormProps = {
    search: BankStatementSearchCriteria
    onSubmit: (search: BankStatementSearchCriteria) => void
    onReset: () => void
}

function BankStatementSearchForm({
    search,
    onSubmit,
    onReset,
}: BankStatementSearchFormProps) {
    const [customerId, setCustomerId] = useState(search.customerId)
    const [customerName, setCustomerName] = useState(search.customerName)
    const [bankAccount, setBankAccount] = useState(search.bankAccount)
    const [dateFrom, setDateFrom] = useState(() => dateFromSearchValue(search.from))
    const [dateTo, setDateTo] = useState(() => dateFromSearchValue(search.to))

    function submitSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        onSubmit({
            from: String(formData.get('from') ?? ''),
            to: String(formData.get('to') ?? ''),
            statementNumber: String(formData.get('statementNumber') ?? '').trim(),
            documentNumber: String(formData.get('documentNumber') ?? '').trim(),
            bankAccount,
            customerId: String(formData.get('customerId') ?? '').trim(),
            customerName: String(formData.get('customerName') ?? '').trim(),
            page: String(defaultPage),
            pageSize: search.pageSize,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
        })
    }

    function clearSearch(_event: FormEvent<HTMLFormElement>) {
        setCustomerId('')
        setCustomerName('')
        setBankAccount('')
        setDateFrom(undefined)
        setDateTo(undefined)
        onReset()
    }

    return (
        <form className="max-w-4xl" onSubmit={submitSearch} onReset={clearSearch}>
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
                                onChange={setBankAccount}
                            />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <DatePickerField
                                id="statement-date-from"
                                label="Payment date from"
                                name="from"
                                date={dateFrom}
                                onSelect={setDateFrom}
                            />
                            <DatePickerField
                                id="statement-date-to"
                                label="Payment date to"
                                name="to"
                                date={dateTo}
                                onSelect={setDateTo}
                            />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <CustomerPickerField
                                id="statement-customer-id"
                                label="Counterparty number"
                                name="customerId"
                                customerId={customerId}
                                onCustomerIdChange={setCustomerId}
                                onCustomerNameChange={setCustomerName}
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
                                    onChange={(event) => setCustomerName(event.target.value)}
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
