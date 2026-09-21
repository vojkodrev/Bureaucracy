import ProductSearch from '@/components/product-search/ProductSearch'
import InvoiceSearch from '@/components/invoice-search/InvoiceSearch'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { ComponentMode } from '@/lib/component-mode'

type Props = {
    productId: number | null
    productCode: string
    productName: string
    hasUnsavedChanges: boolean
    onProductSelect: (productCode: string) => void
    onInvoiceSelect: (invoiceNumber: string) => void
}

function ProductRelatedData({
    productId,
    productCode,
    productName,
    hasUnsavedChanges,
    onProductSelect,
    onInvoiceSelect,
}: Props) {
    if (productId == null || hasUnsavedChanges || !productName.trim()) return null

    return (
        <Accordion className="mt-6">
            <AccordionItem value="similar-products">
                <AccordionTrigger>Similar products</AccordionTrigger>
                <AccordionContent keepMounted>
                    <ProductSearch
                        mode={ComponentMode.Dialog}
                        showSearchFields={false}
                        showInvoiceCount
                        similarName={productName}
                        onProductSelect={(product) => {
                            if (product.productCode) onProductSelect(product.productCode)
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="invoices">
                <AccordionTrigger>Invoices</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InvoiceSearch
                        key={productCode}
                        mode={ComponentMode.Dialog}
                        defaultProductCode={productCode}
                        showSearchFields={false}
                        showSummary={false}
                        onInvoiceSelect={(invoice) => onInvoiceSelect(invoice.invoiceNumber)}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default ProductRelatedData
