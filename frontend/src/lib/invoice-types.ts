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
    paidAmount?: number | null
    purchaseOrderNumber?: string | null
    deliveryNoteNumber?: string | null
    issueDate: string | null
    serviceDate?: string | null
    dueDate: string | null
    paymentDate: string | null
    introductoryText?: string | null
    closingText?: string | null
    items?: InvoiceItem[]
}

export type InvoiceItem = {
    id: number
    sequence: number | null
    productCode: string | null
    productName: string | null
    unit?: string | null
    taxCode?: string | null
    taxRate?: number | null
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

export type InvoiceCustomerSummary = {
    customerCode: string | null
    customerName: string | null
    invoices: Invoice[]
    totalPaid: number
    totalOutstanding: number
    totalOverdue: number
    totalInvoiced: number
}

export type InvoiceCustomerSummaryPage = {
    customerSummaries: InvoiceCustomerSummary[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export type InvoiceResponse = {
    data?: { invoice: Invoice | null }
    errors?: { message: string }[]
}

export type LatestInvoiceResponse = {
    data?: { searchInvoices: { invoices: Pick<Invoice, 'invoiceNumber'>[] } }
    errors?: { message: string }[]
}
