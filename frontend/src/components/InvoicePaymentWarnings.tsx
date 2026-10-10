import type { ReactNode } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/formatters'

type InvoicePaymentWarningsProps = {
    paidAmount: number | null
    href: string
    dateIssue?: 'missing' | 'mismatch'
    dateTooltip?: ReactNode
    amountMismatch?: boolean
    amountTooltip?: ReactNode
}

function InvoicePaymentWarnings({
    paidAmount,
    href,
    dateIssue,
    dateTooltip,
    amountMismatch = false,
    amountTooltip,
}: InvoicePaymentWarningsProps) {
    return (
        <>
            {dateIssue && (
                <Tooltip>
                    <TooltipTrigger
                        render={(
                            <Link
                                to={href}
                                className="relative z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-900 hover:underline dark:bg-amber-950 dark:text-amber-200"
                            />
                        )}
                    >
                        <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                        {paidAmount == null ? '—' : formatCurrency(paidAmount)} paid, date {dateIssue}
                    </TooltipTrigger>
                    <TooltipContent>{dateTooltip}</TooltipContent>
                </Tooltip>
            )}
            {amountMismatch && (
                <Tooltip>
                    <TooltipTrigger
                        render={(
                            <Link
                                to={href}
                                className="relative z-20 inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-orange-100 px-2 py-1 font-medium text-orange-950 hover:underline dark:bg-orange-900 dark:text-orange-100"
                            />
                        )}
                    >
                        <AlertTriangleIcon className="size-4 shrink-0" aria-hidden="true" />
                        {paidAmount == null ? '—' : formatCurrency(paidAmount)} paid, amount mismatch
                    </TooltipTrigger>
                    <TooltipContent>{amountTooltip}</TooltipContent>
                </Tooltip>
            )}
        </>
    )
}

export default InvoicePaymentWarnings
