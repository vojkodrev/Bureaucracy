export type PaymentStatus = 'all' | 'overdue' | 'paid' | 'unpaid'
export type InvoiceResultsView = 'invoiceList' | 'customer'

export type InvoiceSortColumn =
    | 'invoiceNumber'
    | 'customer'
    | 'amount'
    | 'issueDate'
    | 'dueDate'
    | 'paymentDate'

export type SortDirection = 'asc' | 'desc'

export type InvoiceSearchCriteria = {
    invoiceNumber: string
    customerId: string
    customerName: string
    productCode: string
    productName: string
    from: string
    to: string
    paymentStatus: PaymentStatus
    resultsView: InvoiceResultsView
    page: string
    pageSize: string
    sortBy: InvoiceSortColumn | ''
    sortDirection: SortDirection | ''
}

export const paymentStatuses: PaymentStatus[] = ['all', 'overdue', 'paid', 'unpaid']
export const invoiceResultsViews: InvoiceResultsView[] = ['invoiceList', 'customer']

export const invoiceSortColumns: InvoiceSortColumn[] = [
    'invoiceNumber',
    'customer',
    'amount',
    'issueDate',
    'dueDate',
    'paymentDate',
]
