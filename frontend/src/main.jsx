import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LayoutPage from './pages/LayoutPage.tsx'
import InvoiceSearchPage from './pages/InvoiceSearchPage.tsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/invoices/search" replace />}
            />
            <Route element={<LayoutPage />}>
                <Route
                    path="/invoices/search"
                    element={<InvoiceSearchPage />}
                />
            </Route>
        </Routes>
    </BrowserRouter>,
)
