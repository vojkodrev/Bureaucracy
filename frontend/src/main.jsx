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
    GoodsReceiptSearchPage,
    GoodsReceiptPage,
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
import { initializeAuth, isStorageOnlyUser } from "./lib/auth.ts";

function HomeRedirect() {
    return (
        <Navigate
            to={isStorageOnlyUser() ? "/inventory-items/search" : "/invoices/search"}
            replace
        />
    );
}

function createRouter() {
    return createBrowserRouter([
        {
            path: "/",
            element: <HomeRedirect />,
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
                { path: "/goods-receipts/search", element: <GoodsReceiptSearchPage /> },
                {
                    path: "/goods-receipt/:receiptNumber?",
                    element: <GoodsReceiptPage />,
                },
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
}

initializeAuth()
    .then(() => {
        const router = createRouter();
        createRoot(document.getElementById("root")).render(
            <Suspense fallback={null}>
                <RouterProvider router={router} />
                <Toaster />
            </Suspense>,
        );
    })
    .catch((error) => createRoot(document.getElementById("root")).render(
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Sign-in failed</h1>
            <p>{error instanceof Error ? error.message : "Authentication failed."}</p>
        </main>,
    ));
