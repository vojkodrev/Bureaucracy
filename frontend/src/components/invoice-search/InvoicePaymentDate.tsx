import InvoicePaymentWarnings from '@/components/InvoicePaymentWarnings'
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
            {paidAmount != null && paidAmount !== 0 && (
                <InvoicePaymentWarnings
                    paidAmount={paidAmount}
                    href={`/bank-statements/search?documentNumber=${encodeURIComponent(invoiceNumber)}`}
                    dateIssue={isPaymentDateMissing ? 'missing' : undefined}
                    dateTooltip="A paid amount is recorded, but the payment date is missing. Click to search bank statements for this invoice number."
                    amountMismatch={isPaidAmountMismatch}
                    amountTooltip={(
                        <>The paid amount does not match the invoice amount of {amount == null ? '—' : formatCurrency(amount)}. Click to search bank statements for this invoice number.</>
                    )}
                />
            )}
        </div>
    )
}

export default InvoicePaymentDate
