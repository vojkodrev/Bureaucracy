import { Navigate, Route, Routes } from 'react-router-dom'
import InvoiceDetailsPage from './pages/InvoiceDetailsPage.jsx'
import InvoicePage from './pages/InvoicePage.jsx'
import InvoiceSearchPage from './pages/InvoiceSearchPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/invoices/search" replace />} />
      <Route path="/invoice" element={<InvoicePage />} />
      <Route path="/invoice/:id" element={<InvoiceDetailsPage />} />
      <Route path="/invoices/search" element={<InvoiceSearchPage />} />
    </Routes>
  )
}

export default App
