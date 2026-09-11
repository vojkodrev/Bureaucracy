export type BankStatementEntry = {
    id: number
    statementId: number
    statementNumber: number | null
    paymentDate: string | null
    customerId: string | null
    customerName: string | null
    transactionType: string | null
    transactionTypeId: number | null
    outflow: number | null
    inflow: number | null
    documentNumber: string | null
}

export type BankStatementPage = {
    entries: BankStatementEntry[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export type BankStatement = {
    id: number
    statementNumber: number | null
    statementDate: string | null
    bankAccount: string | null
    entries: BankStatementEntry[]
}
