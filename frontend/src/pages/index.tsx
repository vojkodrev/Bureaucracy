import { lazy } from 'react'

export const BusinessYearsPage = lazy(() => import('./BusinessYearsPage'))
export const BankStatementSearchPage = lazy(() => import('./BankStatementSearchPage'))
export const BankStatementPage = lazy(() => import('./bank-statement/BankStatementPage'))
export const ImportBankStatementsPage = lazy(() => import('./bank-statement/ImportBankStatementsPage'))
export const CustomerSearchPage = lazy(() => import('./CustomerSearchPage'))
export const CustomerPage = lazy(() => import('./customer/CustomerPage'))
export const LayoutPage = lazy(() => import('./LayoutPage'))
export const InvoiceSearchPage = lazy(() => import('@/components/invoice-search/InvoiceSearchPage'))
export const InvoicePage = lazy(() => import('./invoice/InvoicePage'))
export const ProductSearchPage = lazy(() => import('./ProductSearchPage'))
export const ProductPage = lazy(() => import('./product/ProductPage'))
export const ExportDataPage = lazy(() => import('./ExportDataPage'))
