export function optionalDate(value: string): string | null {
    return value === '' ? null : `${value}T00:00:00.000Z`
}

export function dateFromSearchValue(value: string): Date | undefined {
    if (!value) return undefined

    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function dateForApi(date?: Date): string | null {
    if (!date) return null

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}T00:00:00Z`
}

export function dateAfterDays(date: Date | undefined, days: number | null): Date | undefined {
    if (!date || days == null) return undefined

    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}
