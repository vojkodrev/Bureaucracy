import { lazy } from "react";

export const BusinessYearsPage = lazy(() => import("./BusinessYearsPage"));
export const BankStatementSearchPage = lazy(
    () => import("./BankStatementSearchPage"),
);
export const BankStatementPage = lazy(
    () => import("./bank-statement/BankStatementPage"),
);
export const ImportBankStatementsPage = lazy(
    () => import("./bank-statement/ImportBankStatementsPage"),
);
export const CustomerSearchPage = lazy(() => import("./CustomerSearchPage"));
export const CustomerPage = lazy(() => import("./customer/CustomerPage"));
export const LayoutPage = lazy(() => import("./layout/LayoutPage"));
export const InvoiceSearchPage = lazy(
    () => import("@/components/invoice-search/InvoiceSearchPage"),
);
export const InvoicePage = lazy(() => import("./invoice/InvoicePage"));
export const InventoryItemSearchPage = lazy(
    () => import("./InventoryItemSearchPage"),
);
export const InventoryItemPage = lazy(
    () => import("./inventory-item/InventoryItemPage"),
);
export const PriceQuoteSearchPage = lazy(
    () => import("./price-quote-search/PriceQuoteSearchPage"),
);
export const PriceQuotePage = lazy(
    () => import("./price-quote/PriceQuotePage"),
);
export const ProductSearchPage = lazy(() => import("./ProductSearchPage"));
export const ProductPage = lazy(() => import("./product/ProductPage"));
export const ExportDataPage = lazy(() => import("./ExportDataPage"));
