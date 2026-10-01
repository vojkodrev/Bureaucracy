import { AlertTriangleIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'

type InvoicePaymentDateProps = Pick<Invoice, 'invoiceNumber' | 'amount' | 'paidAmount' | 'paymentDate'>

function InvoicePaymentDate({ invoiceNumber, amount, paidAmount, paymentDate }: InvoicePaymentDateProps) {
    const isPaymentDateMissing = !paymentDate && paidAmount != null && paidAmount !== 0
    const isPaidAmountMismatch = amount != null
        && paidAmount != null
        && paidAmount !== 0
        && Math.round(amount * 100) !== Math.round(paidAmount * 100)

    return (
        <div className="flex flex-wrap items-center gap-2">
            {paymentDate ? <span>{formatDate(paymentDate)}</span> : !isPaymentDateMissing && formatDate(paymentDate)}
            {isPaymentDateMissing && (
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
            )}
            {isPaidAmountMismatch && (
                <Tooltip>
                    <TooltipTrigger
                        render={(
                            <Link
                                to={`/bank-statements/search?documentNumber=${encodeURIComponent(invoiceNumber)}`}
                                className="relative z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-orange-100 px-2 py-1 font-medium text-orange-950 hover:underline dark:bg-orange-900 dark:text-orange-100"
                            />
                        )}
                    >
                        <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                        {formatCurrency(paidAmount)} paid, amount mismatch
                    </TooltipTrigger>
                    <TooltipContent>
                        The paid amount does not match the invoice amount of {formatCurrency(amount)}. Click to search bank statements for this invoice number.
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    )
}

export default InvoicePaymentDate
