import { formatCurrency } from '@/lib/formatters'
import { roundCurrency } from '@/lib/numbers'
import type { Invoice } from '@/lib/invoice-types'

type InvoiceAmountProps = Pick<Invoice, 'amount' | 'creditedAmount'>

function InvoiceAmount({ amount, creditedAmount = 0 }: InvoiceAmountProps) {
    const invoiceAmount = amount ?? 0
    const credits = roundCurrency(creditedAmount)

    if (credits === 0) return formatCurrency(invoiceAmount)

    const amountDue = Math.max(0, roundCurrency(invoiceAmount - credits))

    return (
        <div className="whitespace-nowrap tabular-nums">
            <div className="font-normal">{formatCurrency(amountDue)} due</div>
            <div className="text-xs font-normal text-foreground">
                {formatCurrency(invoiceAmount)} invoice · −{formatCurrency(credits)} credits
            </div>
        </div>
    )
}

export default InvoiceAmount
