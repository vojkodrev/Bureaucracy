export const defaultPage = 1
export const defaultPageSize = 20
export const maximumPageSize = 100

export function positiveInteger(
    value: string | null,
    fallback: number,
): number {
    const parsedValue = Number.parseInt(value ?? '', 10)
    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallback
}
