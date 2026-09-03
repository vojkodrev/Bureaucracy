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
    items?: InvoiceItem[]
}

export type InvoiceItem = {
    id: number
    sequence: number | null
    productCode: string | null
    productName: string | null
    unitPrice: number | null
    unitTaxAmount: number | null
    quantity: number | null
    discount: number | null
    netAmount: number | null
    grossAmount: number | null
}

export type InvoicePage = {
    invoices: Invoice[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
