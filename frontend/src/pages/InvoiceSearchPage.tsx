import { Link } from 'react-router-dom'

function InvoiceSearchPage() {
    return (
        <section>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        Invoices
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        Invoice search
                    </h1>
                </div>

                <Link
                    to="/invoice"
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                >
                    New invoice
                </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <Link
                    to="/invoice/123"
                    className="flex items-center justify-between px-5 py-4 transition hover:bg-zinc-50"
                >
                    <span className="font-medium">Invoice 123</span>
                    <span className="text-sm text-zinc-500">Open invoice →</span>
                </Link>
            </div>
        </section>
    )
}

export default InvoiceSearchPage
