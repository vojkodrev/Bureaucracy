export function cityWithoutPostalCode(city: string | null | undefined, postalCode: string | null | undefined) {
    const normalizedCity = city?.trim() ?? ''
    const normalizedPostalCode = postalCode?.trim() ?? ''

    if (!normalizedPostalCode || !normalizedCity.startsWith(normalizedPostalCode)) {
        return normalizedCity
    }

    const remainder = normalizedCity.slice(normalizedPostalCode.length)
    return /^\s/.test(remainder) ? remainder.trimStart() : normalizedCity
}

export function postalCodeAndCity(postalCode: string | null | undefined, city: string | null | undefined) {
    const normalizedPostalCode = postalCode?.trim() ?? ''
    const normalizedCity = cityWithoutPostalCode(city, normalizedPostalCode)
    return [normalizedPostalCode, normalizedCity].filter(Boolean).join(' ')
}
