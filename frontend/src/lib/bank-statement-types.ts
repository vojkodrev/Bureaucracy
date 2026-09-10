export type BankStatementEntry = {
    id: number
    statementId: number
    statementNumber: number | null
    paymentDate: string | null
    customerId: string | null
    customerName: string | null
    transactionType: string | null
    outflow: number | null
    inflow: number | null
    invoiceNumber: string | null
}

export type BankStatementPage = {
    entries: BankStatementEntry[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
