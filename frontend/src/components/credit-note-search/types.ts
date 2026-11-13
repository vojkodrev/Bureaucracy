export type CreditNoteSortColumn =
    | 'creditNoteNumber'
    | 'customer'
    | 'amount'
    | 'issueDate'
    | 'dueDate'

export type CreditNoteSearchCriteria = {
    creditNoteNumber: string
    customerId: string
    customerName: string
    productCode: string
    productName: string
    originalInvoiceNumber: string
    from: string
    to: string
    page: string
    pageSize: string
    sortBy: CreditNoteSortColumn | ''
    sortDirection: 'asc' | 'desc' | ''
}

export const creditNoteSortColumns: CreditNoteSortColumn[] = [
    'creditNoteNumber',
    'customer',
    'amount',
    'issueDate',
    'dueDate',
]
