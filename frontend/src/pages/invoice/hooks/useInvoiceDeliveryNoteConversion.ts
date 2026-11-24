import { useEffect, useRef, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { getSelectedBusinessYear, setSelectedBusinessYear } from '@/lib/business-year'
import { fetchBusinessYearCode, fetchCurrentBusinessYear } from '@/lib/business-year-api'
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
            const currentYear = await fetchCurrentBusinessYear()
            if (pendingLookup.current !== lookup) return
            const referenceYearCode = serviceYear === undefined
                ? selectedCode
                : serviceYear === currentYear.year
                    ? currentYear.code
                    : await fetchBusinessYearCode(serviceYear, selectedCode)
            if (pendingLookup.current !== lookup) return
            const number = await findExistingDeliveryNote(draft.deliveryNoteNumber, referenceYearCode)
            if (pendingLookup.current !== lookup) return
            const existingNumber = number ?? (referenceYearCode === currentYear.code
                ? null
                : await findExistingDeliveryNote(draft.deliveryNoteNumber, currentYear.code))
            if (pendingLookup.current !== lookup) return
            if (existingNumber) {
                setMatch({ draft, number: existingNumber, businessYearCode: currentYear.code })
                return
            }
            convert(currentYear.code, deliveryNoteNumberFromInvoiceReference(draft.deliveryNoteNumber))
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
