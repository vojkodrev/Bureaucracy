import { getSelectedBusinessYear } from './business-year'
import { postGraphql } from './graphql'
import type { BusinessYear, BusinessYearResponse } from './business-year-types'

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
    return postGraphql<T>(query, variables, signal)
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

export async function fetchBusinessYearCode(
    year: number,
    preferredCode: string,
): Promise<string> {
    const result = await request<{
        data: { businessYears: { businessYears: Pick<BusinessYear, 'code' | 'year'>[] } }
    }>(`
        query BusinessYearCodes {
            businessYears(sortBy: "code", sortDirection: "desc", pageSize: 10000) {
                businessYears { code year }
            }
        }
    `)
    const matches = result.data.businessYears.businessYears.filter((entry) => entry.year === year)
    const code = matches.find((entry) => entry.code === preferredCode)?.code
        ?? matches.find((entry) => entry.code)?.code
    if (!code) throw new Error(`No business year is configured for ${year}`)
    return code
}
