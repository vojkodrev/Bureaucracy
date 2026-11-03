export function numberOrNull(value: string): number | null {
    if (!value.trim()) return null

    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

export function roundCurrency(value: number): number {
    return currencyCents(value) / 100
}

export function currencyCents(value: number): number {
    const scaledValue = value * 100
    return scaledValue < 0 ? -Math.round(-scaledValue) : Math.round(scaledValue)
}

export function sumCurrencyCents(values: Array<number | null | undefined>): number {
    return values.reduce<number>((sum, value) => sum + currencyCents(value ?? 0), 0)
}

export function sumCurrency(values: Array<number | null | undefined>): number {
    return sumCurrencyCents(values) / 100
}

export function isOptionalNonNegativeNumber(value: string): boolean {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isFinite(number) && number >= 0
}

export function nextPaddedNumber(value: string | null | undefined, minimumLength: number): string {
    const trimmedValue = value?.trim() ?? ''
    const currentNumber = /^\d+$/.test(trimmedValue)
        ? Number.parseInt(trimmedValue, 10)
        : 0
    return String(currentNumber + 1).padStart(Math.max(trimmedValue.length, minimumLength), '0')
}
