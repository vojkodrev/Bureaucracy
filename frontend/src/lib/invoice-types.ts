export type Invoice = {
    id?: number
    invoiceNumber: string
    customerCode: string | null
    customerName: string | null
    customerAddress?: string | null
    customerPostalCode?: string | null
    customerCity?: string | null
    customerCountry?: string | null
    amount: number | null
    issueDate: string | null
    dueDate: string | null
    paymentDate: string | null
}

export type InvoicePage = {
    invoices: Invoice[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
