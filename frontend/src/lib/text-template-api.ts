import { getSelectedBusinessYear } from './business-year'
import { postGraphql } from './graphql'

export enum TextTemplateDocumentType {
    Invoice = 'INVOICE',
    PriceQuote = 'PRICE_QUOTE',
    DeliveryNote = 'DELIVERY_NOTE',
    CreditNote = 'CREDIT_NOTE',
}

export type TextTemplate = {
    introductoryText: string | null
    closingText: string | null
}

const query = `
    query TextTemplate(
        $businessYear: String!
        $documentType: TextTemplateDocumentType!
    ) {
        textTemplate(
            businessYear: $businessYear
            documentType: $documentType
        ) {
            introductoryText closingText
        }
    }
`

export async function fetchTextTemplate(
    documentType: TextTemplateDocumentType,
    signal?: AbortSignal,
): Promise<TextTemplate> {
    const result = await postGraphql<{
        data?: { textTemplate: TextTemplate }
    }>(query, {
        businessYear: getSelectedBusinessYear(),
        documentType,
    }, signal)
    return result.data?.textTemplate ?? {
        introductoryText: null,
        closingText: null,
    }
}
