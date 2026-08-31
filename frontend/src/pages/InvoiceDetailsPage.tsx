import { useParams } from 'react-router-dom'

function InvoiceDetailsPage() {
    const { id } = useParams()

    return (
        <section>
            <div>
                <p className="text-sm font-medium text-zinc-500">
                    Invoice details
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Invoice {id}
                </h1>
            </div>

            <form
                className="mt-6 grid gap-5 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:grid-cols-2"
                onSubmit={(event) => event.preventDefault()}
            >
                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Invoice number
                    <input
                        name="invoiceNumber"
                        defaultValue={id}
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Customer ID
                    <input
                        name="customerId"
                        defaultValue="C-1003"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700 md:col-span-2">
                    Customer
                    <input
                        name="customer"
                        defaultValue="Juniper Labs"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Amount
                    <input
                        name="amount"
                        defaultValue="3475.00"
                        inputMode="decimal"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Invoice date
                    <input
                        type="date"
                        name="invoiceDate"
                        defaultValue="2026-07-25"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Due date
                    <input
                        type="date"
                        name="dueDate"
                        defaultValue="2026-08-24"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                    Payment date
                    <input
                        type="date"
                        name="paymentDate"
                        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    />
                </label>
            </form>
        </section>
    )
}

export default InvoiceDetailsPage
