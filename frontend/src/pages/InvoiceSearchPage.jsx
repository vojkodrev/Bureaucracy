import { Link } from 'react-router-dom'

function InvoiceSearchPage() {
    return (
        <main>
            <h1>Invoice search</h1>
            <nav>
                <Link to="/invoice">Open invoice</Link>
                {' | '}
                <Link to="/invoice/123">Open invoice 123</Link>
            </nav>
        </main>
    )
}

export default InvoiceSearchPage
