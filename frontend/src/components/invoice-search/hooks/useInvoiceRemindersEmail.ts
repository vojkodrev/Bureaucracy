import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import type { InvoiceCustomerSummary, InvoiceCustomerSummaryPage } from '@/lib/invoice-types'
import { toast } from '@/lib/toast'
import { sendInvoiceRemindersEmail } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

export function useInvoiceRemindersEmail(
    search: InvoiceSearchCriteria,
    customerSummaryPage: InvoiceCustomerSummaryPage | null,
    canEmail: boolean,
    onUnavailable: () => void,
) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [target, setTarget] = useState<{ search: InvoiceSearchCriteria; customer: InvoiceCustomerSummary } | null>(null)
    const customerSummary = target?.customer ?? customerSummaryPage?.customerSummaries[0]

    async function sendReminders(fields: Parameters<typeof sendInvoiceRemindersEmail>[1]) {
        await sendInvoiceRemindersEmail(target?.search ?? search, fields)
        toast.add({
            title: 'Reminders emailed',
            description: `Reminders were sent to ${fields.recipient}.`,
            type: 'success',
        })
    }

    function openDialog() {
        setTarget(null)
        if (canEmail) setDialogOpen(true)
        else onUnavailable()
    }

    return {
        dialogOpen,
        setDialogOpen,
        openDialog,
        openCustomerDialog: (customer: InvoiceCustomerSummary, customerSearch: InvoiceSearchCriteria) => {
            setTarget({ customer, search: customerSearch })
            setDialogOpen(true)
        },
        customerId: customerSummary?.customerCode ?? search.customerId,
        customerName: customerSummary?.customerName ?? search.customerName,
        businessYear: Number(getSelectedBusinessYear()) || null,
        sendReminders,
    }
}
