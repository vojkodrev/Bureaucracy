import InvoiceSearch from '@/components/InvoiceSearch'
import { ComponentMode } from '@/lib/component-mode'
import { useNavigate } from 'react-router-dom'

function InvoiceSearchPage() {
    const navigate = useNavigate()

    return (
        <InvoiceSearch
            mode={ComponentMode.Page}
            onInvoiceSelect={(invoice) =>
                navigate(`/invoice/${encodeURIComponent(invoice.invoiceNumber)}`)
            }
        />
    )
}

export default InvoiceSearchPage
