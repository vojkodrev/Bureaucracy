import { AlertTriangleIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'

type InvoicePaymentDateProps = Pick<Invoice, 'invoiceNumber' | 'paidAmount' | 'paymentDate'>

function InvoicePaymentDate({ invoiceNumber, paidAmount, paymentDate }: InvoicePaymentDateProps) {
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
                    <Link
                        to={`/bank-statements/search?documentNumber=${encodeURIComponent(invoiceNumber)}`}
                        className="relative z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-900 hover:underline dark:bg-amber-950 dark:text-amber-200"
                    />
                )}
            >
                <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                {formatCurrency(paidAmount)} paid, date missing
            </TooltipTrigger>
            <TooltipContent>
                A paid amount is recorded, but the payment date is missing. Click to search bank statements for this invoice number.
            </TooltipContent>
        </Tooltip>
    )
}

export default InvoicePaymentDate
