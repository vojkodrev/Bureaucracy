import { useState } from 'react'
import { getSelectedBusinessYear } from '@/lib/business-year'
import type { InvoiceCustomerSummaryPage } from '@/lib/invoice-types'
import { toast } from '@/lib/toast'
import { sendInvoiceRemindersEmail } from '../invoice-search-api'
import type { InvoiceSearchCriteria } from '../types'

export function useInvoiceRemindersEmail(
    search: InvoiceSearchCriteria,
    customerSummaryPage: InvoiceCustomerSummaryPage | null,
) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const customerSummary = customerSummaryPage?.customerSummaries[0]

    async function sendReminders(fields: Parameters<typeof sendInvoiceRemindersEmail>[1]) {
        await sendInvoiceRemindersEmail(search, fields)
        toast.add({
            title: 'Reminders emailed',
            description: `Reminders were sent to ${fields.recipient}.`,
            type: 'success',
        })
    }

    return {
        dialogOpen,
        setDialogOpen,
        openDialog: () => setDialogOpen(true),
        customerId: customerSummary?.customerCode ?? search.customerId,
        customerName: customerSummary?.customerName ?? search.customerName,
        businessYear: Number(getSelectedBusinessYear()) || null,
        sendReminders,
    }
}
