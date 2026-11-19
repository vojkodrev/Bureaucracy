import { useEffect, useRef, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { getSelectedBusinessYear, setSelectedBusinessYear } from '@/lib/business-year'
import { fetchBusinessYearCode } from '@/lib/business-year-api'
import {
    deliveryNoteNumberFromInvoiceReference,
    findExistingDeliveryNote,
    storeInvoiceForDeliveryNote,
} from '../invoice-delivery-note-conversion'
import type { InvoiceDraft } from './useInvoiceDraft'

type Options = {
    draft: InvoiceDraft
    navigate: NavigateFunction
    allowNavigation: () => void
}

export function useInvoiceDeliveryNoteConversion({ draft, navigate, allowNavigation }: Options) {
    const [error, setError] = useState<string | null>(null)
    const [match, setMatch] = useState<{
        draft: InvoiceDraft
        number: string
        businessYearCode: string
    } | null>(null)
    const currentMatch = match?.draft === draft ? match : null
    const pendingLookup = useRef<object | null>(null)

    useEffect(() => () => { pendingLookup.current = null }, [draft])

    const convert = (businessYearCode: string, deliveryNoteNumber: string) => {
        try {
            storeInvoiceForDeliveryNote(draft, deliveryNoteNumber)
            setError(null)
            if (businessYearCode !== getSelectedBusinessYear()) {
                setSelectedBusinessYear(businessYearCode)
            }
            allowNavigation()
            navigate('/delivery-note')
        } catch (conversionError: unknown) {
            setError(conversionError instanceof Error
                ? conversionError.message : 'Preparing the delivery note draft failed')
        }
    }

    const convertToDeliveryNote = async () => {
        if (pendingLookup.current || currentMatch) return
        const lookup = {}
        pendingLookup.current = lookup
        setError(null)
        try {
            const selectedCode = getSelectedBusinessYear()
            const serviceYear = draft.serviceDate?.getFullYear()
            const businessYearCode = serviceYear === undefined
                ? selectedCode
                : await fetchBusinessYearCode(serviceYear, selectedCode)
            if (pendingLookup.current !== lookup) return
            const number = await findExistingDeliveryNote(draft.deliveryNoteNumber, businessYearCode)
            if (pendingLookup.current !== lookup) return
            if (number) {
                setMatch({ draft, number, businessYearCode })
                return
            }
            convert(businessYearCode, deliveryNoteNumberFromInvoiceReference(draft.deliveryNoteNumber))
        } catch (lookupError: unknown) {
            if (pendingLookup.current !== lookup) return
            setError(lookupError instanceof Error
                ? lookupError.message : 'Checking for an existing delivery note failed')
        } finally {
            if (pendingLookup.current === lookup) pendingLookup.current = null
        }
    }

    return {
        convertToDeliveryNote,
        convertAnyway: () => {
            if (currentMatch) convert(currentMatch.businessYearCode, '')
        },
        existingNumber: currentMatch?.number ?? null,
        dismissConfirmation: () => setMatch(null),
        error,
    }
}
