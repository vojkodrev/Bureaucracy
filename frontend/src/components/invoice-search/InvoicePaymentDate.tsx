import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'

type InvoicePaymentDateProps = Pick<Invoice, 'paidAmount' | 'paymentDate'>

function InvoicePaymentDate({ paidAmount, paymentDate }: InvoicePaymentDateProps) {
    if (paymentDate) {
        return formatDate(paymentDate)
    }

    if (paidAmount == null) {
        return formatDate(paymentDate)
    }

    return (
        <Tooltip>
            <TooltipTrigger
                render={(
                    <span className="relative z-20 inline-flex cursor-help items-center font-medium text-orange-600 underline decoration-dotted underline-offset-4 dark:text-orange-400" />
                )}
            >
                {formatCurrency(paidAmount)} · date missing
            </TooltipTrigger>
            <TooltipContent>
                A paid amount is recorded, but the payment date is missing.
            </TooltipContent>
        </Tooltip>
    )
}

export default InvoicePaymentDate
