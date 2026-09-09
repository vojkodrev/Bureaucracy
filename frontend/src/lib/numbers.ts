export function numberOrNull(value: string): number | null {
    if (!value.trim()) return null

    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

export function nextPaddedNumber(value: string | null | undefined, minimumLength: number): string {
    const trimmedValue = value?.trim() ?? ''
    const currentNumber = /^\d+$/.test(trimmedValue)
        ? Number.parseInt(trimmedValue, 10)
        : 0
    return String(currentNumber + 1).padStart(Math.max(trimmedValue.length, minimumLength), '0')
}
