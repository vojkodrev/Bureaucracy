export function optionalFilter(value: string): string | null {
    const trimmedValue = value.trim()
    return trimmedValue === '' ? null : trimmedValue
}
