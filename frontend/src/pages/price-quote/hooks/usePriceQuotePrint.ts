import { useState } from 'react'
import { priceQuotePdfUrl } from '@/pages/price-quote-search/price-quote-search-api'

type Options = { quoteNumber: string; canPrint: boolean; canSave: boolean }

export function usePriceQuotePrint({ quoteNumber, canPrint, canSave }: Options) {
    const [printError, setPrintError] = useState<string | null>(null)
    const [confirmingPrint, setConfirmingPrint] = useState(false)

    const printPriceQuote = () => {
        if (!canPrint) {
            if (canSave) setConfirmingPrint(true)
            return
        }
        const pdfTab = window.open(priceQuotePdfUrl(quoteNumber.trim()), '_blank')
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the price quote PDF.')
            return
        }
        pdfTab.opener = null
        setPrintError(null)
    }

    return { printPriceQuote, printError, setPrintError, confirmingPrint, setConfirmingPrint }
}
