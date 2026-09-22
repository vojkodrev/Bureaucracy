import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import { Toaster } from "./components/ui/toast.tsx";
import {
    BankStatementPage,
    BankStatementSearchPage,
    BusinessYearsPage,
    CustomerPage,
    CustomerSearchPage,
    ExportDataPage,
    InvoicePage,
    InvoiceSearchPage,
    InventoryItemSearchPage,
    InventoryItemPage,
    PriceQuoteSearchPage,
    PriceQuotePage,
    ImportBankStatementsPage,
    LayoutPage,
    ProductPage,
    ProductSearchPage,
} from "./pages";
import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/invoices/search" replace />,
    },
    {
        element: <LayoutPage />,
        children: [
            { path: "/business-years", element: <BusinessYearsPage /> },
            {
                path: "/bank-statements/search",
                element: <BankStatementSearchPage />,
            },
            {
                path: "/bank-statements/import",
                element: <ImportBankStatementsPage />,
            },
            {
                path: "/bank-statement/:statementNumber?",
                element: <BankStatementPage />,
            },
            { path: "/customers/search", element: <CustomerSearchPage /> },
            { path: "/customer/:customerId?", element: <CustomerPage /> },
            { path: "/invoices/search", element: <InvoiceSearchPage /> },
            {
                path: "/inventory-items/search",
                element: <InventoryItemSearchPage />,
            },
            {
                path: "/inventory-item/:productCode?",
                element: <InventoryItemPage />,
            },
            { path: "/price-quotes/search", element: <PriceQuoteSearchPage /> },
            { path: "/price-quote/:quoteNumber?", element: <PriceQuotePage /> },
            { path: "/invoice/:invoiceNumber?", element: <InvoicePage /> },
            { path: "/products/search", element: <ProductSearchPage /> },
            { path: "/product/:productCode?", element: <ProductPage /> },
            { path: "/export", element: <ExportDataPage /> },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    <Suspense fallback={null}>
        <RouterProvider router={router} />
        <Toaster />
    </Suspense>,
);
