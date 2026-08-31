import { useParams } from 'react-router-dom'

function InvoiceDetailsPage() {
    const { id } = useParams()

    return <h1>Invoice {id}</h1>
}

export default InvoiceDetailsPage
