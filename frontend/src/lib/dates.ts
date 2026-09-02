export function optionalDate(value: string): string | null {
    return value === '' ? null : `${value}T00:00:00.000Z`
}

export function dateFromSearchValue(value: string): Date | undefined {
    if (!value) return undefined

    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}
