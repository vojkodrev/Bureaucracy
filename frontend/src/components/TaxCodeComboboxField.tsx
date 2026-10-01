import { useEffect, useState } from 'react'
import { postGraphql } from '@/lib/graphql'
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

type TaxCode = { id: number; code: string; description: string | null; rate: number | null }
type TaxCodesResponse = { data?: { taxCodes: TaxCode[] }; errors?: { message: string }[] }
type TaxCodeComboboxFieldProps = {
    id: string
    label: string
    value: string
    onChange: (code: string, rate: number | null) => void
}

const taxCodesQuery = `
    query TaxCodes($businessYear: String!) {
        taxCodes(businessYear: $businessYear) { id code description rate }
    }
`

function TaxCodeComboboxField({ id, label, value, onChange }: TaxCodeComboboxFieldProps) {
    const [taxCodes, setTaxCodes] = useState<TaxCode[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const abortController = new AbortController()
        void postGraphql<TaxCodesResponse>(taxCodesQuery, {
            businessYear: getSelectedBusinessYear(),
        }, abortController.signal).then((result) => {
            setTaxCodes(result.data?.taxCodes ?? [])
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setError(requestError instanceof Error ? requestError.message : 'Loading tax codes failed')
        })
        return () => abortController.abort()
    }, [])

    const selectedTaxCode = taxCodes.find((taxCode) => taxCode.code === value) ?? null
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Combobox
                items={taxCodes}
                value={selectedTaxCode}
                onValueChange={(taxCode) => onChange(taxCode?.code ?? '', taxCode?.rate ?? null)}
                itemToStringLabel={(taxCode) => `${taxCode.code} — ${taxCode.description ?? ''}`}
                itemToStringValue={(taxCode) => taxCode.code}
                isItemEqualToValue={(taxCode, selected) => taxCode.code === selected.code}
            >
                <ComboboxInput id={id} placeholder={error ?? 'Select tax code'} />
                <ComboboxContent className="w-max min-w-(--anchor-width)">
                    <ComboboxEmpty>{error ?? 'No tax codes found.'}</ComboboxEmpty>
                    <ComboboxList>
                        {(taxCode: TaxCode) => (
                            <ComboboxItem className="whitespace-nowrap" key={taxCode.id} value={taxCode}>
                                {taxCode.code} — {taxCode.description ?? 'No description'} ({taxCode.rate ?? 0}%)
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>
    )
}

export default TaxCodeComboboxField
