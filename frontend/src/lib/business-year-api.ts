import { getSelectedBusinessYear } from './business-year'
import type { BusinessYearResponse } from './business-year-types'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

const businessYearQuery = `
    query BusinessYear($code: String!) {
        businessYear(code: $code) { year }
    }
`

const currentBusinessYearQuery = `
    query CurrentBusinessYear {
        currentBusinessYear { code year }
    }
`

async function request<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal) {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal,
    })
    if (!response.ok) throw new Error(`Loading business year failed (${response.status})`)
    const result = await response.json() as T & { errors?: { message: string }[] }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result
}

export async function fetchBusinessYear(
    signal?: AbortSignal,
    code = getSelectedBusinessYear(),
): Promise<number | null> {
    const result = await request<BusinessYearResponse>(businessYearQuery, {
        code,
    }, signal)
    return result.data?.businessYear?.year ?? null
}

export async function fetchCurrentBusinessYear(): Promise<{ code: string; year: number }> {
    const result = await request<{
        data?: { currentBusinessYear: { code: string | null; year: number | null } | null }
    }>(currentBusinessYearQuery)
    const current = result.data?.currentBusinessYear
    if (!current?.code || current.year == null) throw new Error('No current business year exists')
    return { code: current.code, year: current.year }
}
