import InventoryItemSearch from "@/components/inventory-item-search/InventoryItemSearch";
import ProductSearch from "@/components/product-search/ProductSearch";
import GoodsReceiptSearch from "@/components/goods-receipt-search/GoodsReceiptSearch";
import InventoryItemStockSummary from "./InventoryItemStockSummary";
import InventoryItemPhotos from "./InventoryItemPhotos";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ComponentMode } from "@/lib/component-mode";

type Props = {
    itemId: number | null;
    productCode: string;
    name: string;
    unit: string;
    hasUnsavedChanges: boolean;
    onItemSelect: (code: string) => void;
    onProductSelect: (code: string) => void;
    onGoodsReceiptSelect: (receiptNumber: string) => void;
};

export default function InventoryItemRelatedData({
    itemId,
    productCode,
    name,
    unit,
    hasUnsavedChanges,
    onItemSelect,
    onProductSelect,
    onGoodsReceiptSelect,
}: Props) {
    if (itemId == null || hasUnsavedChanges || !name.trim()) return null;
    return (
        <Accordion className="mt-6" defaultValue={["stock-summary"]}>
            <AccordionItem value="stock-summary">
                <AccordionTrigger>Stock summary</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InventoryItemStockSummary
                        productCode={productCode}
                        unit={unit}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="photos">
                <AccordionTrigger>Photos</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InventoryItemPhotos productCode={productCode} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="similar-inventory-items">
                <AccordionTrigger>Similar inventory items</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InventoryItemSearch
                        mode={ComponentMode.Dialog}
                        showSearchFields={false}
                        similarName={name}
                        onInventoryItemSelect={(item) => {
                            if (item.productCode)
                                onItemSelect(item.productCode);
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="goods-receipts">
                <AccordionTrigger>Goods receipts</AccordionTrigger>
                <AccordionContent keepMounted>
                    <GoodsReceiptSearch
                        key={productCode}
                        mode={ComponentMode.Dialog}
                        showSearchFields={false}
                        showSummary={false}
                        defaultProductCode={productCode}
                        onGoodsReceiptSelect={(receipt) =>
                            onGoodsReceiptSelect(receipt.receiptNumber)
                        }
                    />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="similar-products">
                <AccordionTrigger>Similar products</AccordionTrigger>
                <AccordionContent keepMounted>
                    <ProductSearch
                        mode={ComponentMode.Dialog}
                        showSearchFields={false}
                        similarName={name}
                        onProductSelect={(product) => {
                            if (product.productCode)
                                onProductSelect(product.productCode);
                        }}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
