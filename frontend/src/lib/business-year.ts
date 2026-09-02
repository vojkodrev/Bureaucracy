const businessYearStorageKey = 'businessYear'
const defaultBusinessYear = '22'

export function getSelectedBusinessYear(): string {
    return localStorage.getItem(businessYearStorageKey) ?? defaultBusinessYear
}

export function setSelectedBusinessYear(businessYear: string): void {
    localStorage.setItem(businessYearStorageKey, businessYear)
}
