import InvoicePaymentWarnings from '@/components/InvoicePaymentWarnings'
import { hasPaidAmountMismatch } from '@/components/bank-statement-search/invoice-payment-mismatches'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Invoice } from '@/lib/invoice-types'
import { roundCurrency } from '@/lib/numbers'

type InvoicePaymentDateProps = Pick<Invoice, 'invoiceNumber' | 'amount' | 'creditedAmount' | 'paidAmount' | 'paymentDate'>

function InvoicePaymentDate({ invoiceNumber, amount, creditedAmount = 0, paidAmount, paymentDate }: InvoicePaymentDateProps) {
    const amountAfterCredits = amount == null
        ? null
        : Math.max(0, roundCurrency(amount + creditedAmount))
    const isPaymentDateMissing = !paymentDate && paidAmount != null && paidAmount !== 0
    const isPaidAmountMismatch = amountAfterCredits != null
        && paidAmount != null
        && paidAmount !== 0
        && hasPaidAmountMismatch(amount, creditedAmount, paidAmount)

    return (
        <div className="flex flex-wrap items-center gap-2">
            {paymentDate ? <span>{formatDate(paymentDate)}</span> : !isPaymentDateMissing && formatDate(paymentDate)}
            {paidAmount != null && paidAmount !== 0 && (
                <InvoicePaymentWarnings
                    paidAmount={paidAmount}
                    href={`/bank-statements/search?documentNumber=${encodeURIComponent(invoiceNumber)}`}
                    dateIssue={isPaymentDateMissing ? 'missing' : undefined}
                    dateTooltip="A paid amount is recorded, but the payment date is missing. Click to search bank statements for this invoice number."
                    amountMismatch={isPaidAmountMismatch}
                    amountTooltip={(
                        <>The paid amount does not match the invoice amount after credits of {amountAfterCredits == null ? '—' : formatCurrency(amountAfterCredits)}. Click to search bank statements for this invoice number.</>
                    )}
                />
            )}
        </div>
    )
}

export default InvoicePaymentDate
