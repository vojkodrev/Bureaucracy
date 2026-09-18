const businessYearStorageKey = 'businessYear'
const defaultBusinessYear = '22'

export const businessYearChangedEvent = 'business-year-changed'

export function getSelectedBusinessYear(): string {
    return localStorage.getItem(businessYearStorageKey) ?? defaultBusinessYear
}

export function setSelectedBusinessYear(businessYear: string): void {
    localStorage.setItem(businessYearStorageKey, businessYear)
    window.dispatchEvent(new CustomEvent(businessYearChangedEvent, {
        detail: businessYear,
    }))
}
