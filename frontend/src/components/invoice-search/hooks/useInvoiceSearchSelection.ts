import { useState } from 'react'
import type { Invoice } from '@/lib/invoice-types'

export function useInvoiceSearchSelection(onInvoiceSelect?: (invoice: Invoice) => void) {
    const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)

    function selectInvoice(invoice: Invoice) {
        setSelectedInvoiceNumber(invoice.invoiceNumber)
        onInvoiceSelect?.(invoice)
    }

    function clearSelection() {
        setSelectedInvoiceNumber(null)
    }

    return { selectedInvoiceNumber, selectInvoice, clearSelection }
}
