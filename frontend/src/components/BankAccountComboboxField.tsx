import { useEffect, useState } from 'react'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { getSelectedBusinessYear } from '@/lib/business-year'

type BankAccount = {
    id: number
    code: string
    name: string | null
    accountNumber: string | null
}

type BankAccountsResponse = {
    data?: { bankAccounts: BankAccount[] }
    errors?: { message: string }[]
}

type BankAccountComboboxFieldProps = {
    id: string
    label: string
    value: string
    onChange: (code: string) => void
}

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const bankAccountsQuery = `
    query BankAccounts($businessYear: String!) {
        bankAccounts(businessYear: $businessYear) { id code name accountNumber }
    }
`

function accountLabel(account: BankAccount): string {
    return `${account.code} — ${account.name ?? account.accountNumber ?? ''}`
}

function BankAccountComboboxField({ id, label, value, onChange }: BankAccountComboboxFieldProps) {
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: bankAccountsQuery, variables: { businessYear: getSelectedBusinessYear() } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading bank accounts failed (${response.status})`)
            const result = (await response.json()) as BankAccountsResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            setAccounts(result.data?.bankAccounts ?? [])
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setError(requestError instanceof Error ? requestError.message : 'Loading bank accounts failed')
        })
        return () => abortController.abort()
    }, [])

    const selectedAccount = accounts.find((account) => account.code === value) ?? null
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Combobox
                items={accounts}
                value={selectedAccount}
                onValueChange={(account) => onChange(account?.code ?? '')}
                itemToStringLabel={accountLabel}
                itemToStringValue={(account) => account.code}
                isItemEqualToValue={(account, selected) => account.code === selected.code}
            >
                <ComboboxInput id={id} placeholder={error ?? 'Select bank account'} />
                <ComboboxContent className="w-max min-w-(--anchor-width)">
                    <ComboboxEmpty>{error ?? 'No bank accounts found.'}</ComboboxEmpty>
                    <ComboboxList>
                        {(account: BankAccount) => (
                            <ComboboxItem className="whitespace-nowrap" key={account.id} value={account}>
                                {accountLabel(account)}
                                {account.accountNumber && <span className="text-muted-foreground"> ({account.accountNumber})</span>}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>
    )
}

export default BankAccountComboboxField
