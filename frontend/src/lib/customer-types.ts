export type Customer = {
    id: number
    customerId: string | null
    name: string | null
    address: string | null
    postalCode: string | null
    city: string | null
    country: string | null
    contact: string | null
    email: string | null
    phone: string | null
    taxNumber: string | null
    registrationNumber: string | null
    paymentTerm: number | null
    discount: number | null
}

export type CustomerPage = {
    customers: Customer[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
