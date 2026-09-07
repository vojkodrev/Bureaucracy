export type BusinessYear = {
    code: string | null
    description: string | null
    year: number | null
    derivedFrom: string | null
}

export type BusinessYearResponse = {
    data?: { businessYear: Pick<BusinessYear, 'description'> | null }
    errors?: { message: string }[]
}
