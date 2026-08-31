import { Link } from 'react-router-dom'

type Invoice = {
    invoiceNumber: string
    customer: string
    amount: number
    invoiceDate: string
    dueDate: string
    paymentDate: string
    status: 'paid' | 'past-due'
}

const invoices: Invoice[] = [
    {
        invoiceNumber: 'INV-2026-001',
        customer: 'Northstar Studio',
        amount: 1250,
        invoiceDate: '12 Aug 2026',
        dueDate: '11 Sep 2026',
        paymentDate: '28 Aug 2026',
        status: 'paid',
    },
    {
        invoiceNumber: 'INV-2026-002',
        customer: 'Alpine Goods',
        amount: 840.5,
        invoiceDate: '18 Aug 2026',
        dueDate: '17 Sep 2026',
        paymentDate: '30 Aug 2026',
        status: 'paid',
    },
    {
        invoiceNumber: 'INV-2026-003',
        customer: 'Juniper Labs',
        amount: 3475,
        invoiceDate: '25 Jul 2026',
        dueDate: '24 Aug 2026',
        paymentDate: '—',
        status: 'past-due',
    },
]

const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
})

const summary = [
    {
        label: 'Total amount',
        amount: invoices.reduce((total, invoice) => total + invoice.amount, 0),
    },
    {
        label: 'Unpaid',
        amount: invoices
            .filter((invoice) => invoice.status !== 'paid')
            .reduce((total, invoice) => total + invoice.amount, 0),
    },
    {
        label: 'Past due',
        amount: invoices
            .filter((invoice) => invoice.status === 'past-due')
            .reduce((total, invoice) => total + invoice.amount, 0),
    },
    {
        label: 'Paid',
        amount: invoices
            .filter((invoice) => invoice.status === 'paid')
            .reduce((total, invoice) => total + invoice.amount, 0),
    },
]

function InvoiceSearchPage() {
    return (
        <section>
            <div>
                <div>
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-2 text-sm font-medium text-zinc-500"
                    >
                        <span className="text-zinc-700">Invoices</span>
                    </nav>
                </div>
            </div>

            <form
                className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2 md:w-[calc(50%-0.625rem)]">
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

            <div className="mt-6 flex justify-end">
                <Link
                    to="/invoice"
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                >
                    New invoice
                </Link>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="min-w-225">
                    <div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-zinc-200 bg-zinc-50 px-3 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                        <span>Invoice number</span>
                        <span>Customer</span>
                        <span>Amount</span>
                        <span>Invoice date</span>
                        <span>Due date</span>
                        <span>Payment date</span>
                    </div>

                    {invoices.map((invoice) => (
                        <Link
                            key={invoice.invoiceNumber}
                            to={`/invoice/${invoice.invoiceNumber}`}
                            className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-zinc-100 px-3 py-4 text-sm transition last:border-b-0 hover:bg-zinc-50"
                        >
                            <span className="font-semibold text-zinc-950">
                                {invoice.invoiceNumber}
                            </span>
                            <span>{invoice.customer}</span>
                            <span className="font-medium">
                                {currencyFormatter.format(invoice.amount)}
                            </span>
                            <span className="text-zinc-600">
                                {invoice.invoiceDate}
                            </span>
                            <span className="text-zinc-600">
                                {invoice.dueDate}
                            </span>
                            <span className="text-zinc-600">
                                {invoice.paymentDate}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:w-[calc(50%-0.625rem)]">
                {summary.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 border-b border-zinc-200 p-3 last:border-b-0"
                    >
                        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                            {item.label}
                        </p>
                        <p className="text-base font-semibold text-zinc-950">
                            {currencyFormatter.format(item.amount)}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    )
}

export default InvoiceSearchPage
