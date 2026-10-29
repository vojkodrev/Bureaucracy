import { useEffect, useState } from 'react'
import ProductSearch from '@/components/product-search/ProductSearch'
import InvoiceSearch from '@/components/invoice-search/InvoiceSearch'
import InventoryItemSearch from '@/components/inventory-item-search/InventoryItemSearch'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ComponentMode } from '@/lib/component-mode'
import { isStorageOnlyUser } from '@/lib/auth'
import { fetchProductInvoiceCount } from './product-api'

type Props = {
    productId: number | null
    productCode: string
    productName: string
    hasUnsavedChanges: boolean
    onProductSelect: (productCode: string) => void
    onInvoiceSelect: (invoiceNumber: string) => void
}

function ProductInvoiceCount({ productCode }: { productCode: string }) {
    const [invoiceCount, setInvoiceCount] = useState<number | null>(null)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        void fetchProductInvoiceCount(productCode, controller.signal)
            .then(setInvoiceCount)
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return
                setHasError(true)
            })
        return () => controller.abort()
    }, [productCode])

    return (
        <div className="max-w-sm p-4">
            <Table aria-busy={invoiceCount == null && !hasError}>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Invoices</TableCell>
                        <TableCell className="text-right font-medium">
                            {hasError ? '—' : invoiceCount ?? '…'}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
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
    const storageOnly = isStorageOnlyUser()

    return (
        <Accordion className="mt-6">
            <AccordionItem value="similar-products">
                <AccordionTrigger>Similar products</AccordionTrigger>
                <AccordionContent keepMounted>
                    <ProductSearch
                        mode={ComponentMode.Dialog}
                        showSearchFields={false}
                        similarName={productName}
                        onProductSelect={(product) => {
                            if (product.productCode) onProductSelect(product.productCode)
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="similar-inventory-items">
                <AccordionTrigger>Similar inventory items</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InventoryItemSearch
                        mode={ComponentMode.Page}
                        showSearchFields={false}
                        similarName={productName}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="invoices">
                <AccordionTrigger>Invoices</AccordionTrigger>
                <AccordionContent keepMounted>
                    {storageOnly
                        ? <ProductInvoiceCount key={productCode} productCode={productCode} />
                        : <InvoiceSearch
                            key={productCode}
                            mode={ComponentMode.Dialog}
                            defaultProductCode={productCode}
                            showSearchFields={false}
                            showSummary={false}
                            onInvoiceSelect={(invoice) => onInvoiceSelect(invoice.invoiceNumber)}
                        />}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default ProductRelatedData
