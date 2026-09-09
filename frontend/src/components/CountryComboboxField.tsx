import { useEffect, useState } from 'react'
import {
    Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput,
    ComboboxItem, ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { getSelectedBusinessYear } from '@/lib/business-year'

type Country = { id: number; code: string; name: string }
type CountriesResponse = { data?: { countries: Country[] }; errors?: { message: string }[] }
type CountryComboboxFieldProps = {
    id: string
    label: string
    value: string
    onChange: (code: string) => void
}

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL
const countriesQuery = `
    query Countries($businessYear: String!) {
        countries(businessYear: $businessYear) { id code name }
    }
`

function CountryComboboxField({ id, label, value, onChange }: CountryComboboxFieldProps) {
    const [countries, setCountries] = useState<Country[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: countriesQuery, variables: { businessYear: getSelectedBusinessYear() } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading countries failed (${response.status})`)
            const result = await response.json() as CountriesResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            setCountries(result.data?.countries ?? [])
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setError(requestError instanceof Error ? requestError.message : 'Loading countries failed')
        })
        return () => abortController.abort()
    }, [])

    const selectedCountry = countries.find((country) => country.code === value) ?? null
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Combobox
                items={countries}
                value={selectedCountry}
                onValueChange={(country) => onChange(country?.code ?? '')}
                itemToStringLabel={(country) => `${country.code} — ${country.name}`}
                itemToStringValue={(country) => country.code}
                isItemEqualToValue={(country, selected) => country.code === selected.code}
            >
                <ComboboxInput id={id} placeholder={error ?? 'Select country'} />
                <ComboboxContent className="w-max min-w-(--anchor-width)">
                    <ComboboxEmpty>{error ?? 'No countries found.'}</ComboboxEmpty>
                    <ComboboxList>
                        {(country: Country) => (
                            <ComboboxItem className="whitespace-nowrap" key={country.id} value={country}>
                                {country.code} — {country.name}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>
    )
}

export default CountryComboboxField
