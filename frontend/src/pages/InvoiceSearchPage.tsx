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

            <form
                className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
                        Invoice number
                        <input
                            type="search"
                            name="invoiceNumber"
                            placeholder="e.g. 123"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Customer ID
                        <input
                            type="search"
                            name="customerId"
                            placeholder="e.g. C-1001"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-zinc-700">
                        Customer
                        <input
                            type="search"
                            name="customer"
                            placeholder="Customer name"
                            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                        />
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-5">
                    <button
                        type="reset"
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    >
                        Search
                    </button>
                </div>
            </form>

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
