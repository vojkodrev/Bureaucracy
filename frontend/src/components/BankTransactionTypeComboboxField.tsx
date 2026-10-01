import { useEffect, useState } from 'react'
import { postGraphql } from '@/lib/graphql'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { getSelectedBusinessYear } from '@/lib/business-year'

export type BankTransactionType = { id: number; code: number | null; name: string | null; direction: string | null }
type Response = { data?: { bankTransactionTypes: BankTransactionType[] }; errors?: { message: string }[] }
type Props = { id: string; label: string; value: number | null; onChange: (value: BankTransactionType | null) => void }
const query = `query BankTransactionTypes($businessYear: String!) { bankTransactionTypes(businessYear: $businessYear) { id code name direction } }`

function BankTransactionTypeComboboxField({ id, label, value, onChange }: Props) {
    const [items, setItems] = useState<BankTransactionType[]>([])
    const [error, setError] = useState<string | null>(null)
    useEffect(() => {
        const controller = new AbortController()
        void postGraphql<Response>(
            query,
            { businessYear: getSelectedBusinessYear() },
            controller.signal,
        )
            .then((result) => {
                setItems(result.data?.bankTransactionTypes ?? [])
            }).catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') return
                setError(requestError instanceof Error ? requestError.message : 'Loading transaction types failed')
            })
        return () => controller.abort()
    }, [])
    const selected = items.find((item) => item.code === value) ?? null
    return <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Combobox items={items} value={selected} onValueChange={onChange} itemToStringLabel={(item) => `${item.name ?? item.code ?? ''}`} itemToStringValue={(item) => String(item.code ?? '')} isItemEqualToValue={(item, current) => item.code === current.code}>
            <ComboboxInput id={id} placeholder={error ?? 'Select transaction type'} />
            <ComboboxContent className="w-max min-w-(--anchor-width)"><ComboboxEmpty>{error ?? 'No transaction types found.'}</ComboboxEmpty><ComboboxList>
                {(item: BankTransactionType) => <ComboboxItem key={item.id} value={item}>{item.name ?? `Type ${item.code}`}{item.direction ? ` — ${item.direction}` : ''}</ComboboxItem>}
            </ComboboxList></ComboboxContent>
        </Combobox>
    </Field>
}
export default BankTransactionTypeComboboxField
