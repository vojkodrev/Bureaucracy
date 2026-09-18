import { AlertTriangleIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'

type InvoicePaymentDateProps = Pick<Invoice, 'paidAmount' | 'paymentDate'>

function InvoicePaymentDate({ paidAmount, paymentDate }: InvoicePaymentDateProps) {
    if (paymentDate) {
        return formatDate(paymentDate)
    }

    if (paidAmount == null || paidAmount === 0) {
        return formatDate(paymentDate)
    }

    return (
        <Tooltip>
            <TooltipTrigger
                render={(
                    <span className="relative z-20 inline-flex cursor-help items-center gap-2 whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200" />
                )}
            >
                <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                {formatCurrency(paidAmount)} paid, date missing
            </TooltipTrigger>
            <TooltipContent>
                A paid amount is recorded, but the payment date is missing.
            </TooltipContent>
        </Tooltip>
    )
}

export default InvoicePaymentDate
