import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import BusinessYearsPage from './pages/BusinessYearsPage.tsx'
import CustomerSearchPage from './pages/CustomerSearchPage.tsx'
import LayoutPage from './pages/LayoutPage.tsx'
import InvoiceSearchPage from './pages/InvoiceSearchPage.tsx'
import InvoicePage from './pages/invoice/InvoicePage.tsx'
import ProductSearchPage from './pages/ProductSearchPage.tsx'
import ProductPage from './pages/product/ProductPage.tsx'
import ExportDataPage from './pages/ExportDataPage.tsx'
import { Toaster } from './components/ui/toast.tsx'
import './index.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/invoices/search" replace />,
    },
    {
        element: <LayoutPage />,
        children: [
            { path: '/business-years', element: <BusinessYearsPage /> },
            { path: '/customers/search', element: <CustomerSearchPage /> },
            { path: '/invoices/search', element: <InvoiceSearchPage /> },
            { path: '/invoice/:invoiceNumber?', element: <InvoicePage /> },
            { path: '/products/search', element: <ProductSearchPage /> },
            { path: '/product/:productCode?', element: <ProductPage /> },
            { path: '/export', element: <ExportDataPage /> },
        ],
    },
])

createRoot(document.getElementById('root')).render(
    <>
        <RouterProvider router={router} />
        <Toaster />
    </>,
)
