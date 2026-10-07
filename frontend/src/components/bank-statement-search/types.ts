export type BankStatementSearchCriteria = {
    from: string
    to: string
    statementNumber: string
    documentNumber: string
    reference: string
    bankAccount: string
    customerId: string
    customerName: string
    page: string
    pageSize: string
    sortBy: 'date' | ''
    sortDirection: 'asc' | 'desc' | ''
}
