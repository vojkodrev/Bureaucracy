import { useParams } from 'react-router-dom'

function InvoiceDetailsPage() {
    const { id } = useParams()

    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Invoice details</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Invoice {id}
            </h1>
        </section>
    )
}

export default InvoiceDetailsPage
