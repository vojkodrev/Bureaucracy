export function optionalDate(value: string): string | null {
    return value === '' ? null : `${value}T00:00:00.000Z`
}

export function dateFromSearchValue(value: string): Date | undefined {
    if (!value) return undefined

    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function dateForInput(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function dateForApi(date?: Date): string | null {
    if (!date) return null

    return `${dateForInput(date)}T00:00:00Z`
}

export function dateTimeForApi(date?: Date): string | null {
    if (!date) return null

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const offsetMinutes = -date.getTimezoneOffset()
    const offsetSign = offsetMinutes >= 0 ? '+' : '-'
    const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
    const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
    return `${dateForInput(date)}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetRemainder}`
}

export function dateAfterDays(date: Date | undefined, days: number | null): Date | undefined {
    if (!date || days == null) return undefined

    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}
