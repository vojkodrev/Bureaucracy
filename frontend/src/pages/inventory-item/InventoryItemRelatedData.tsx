import InventoryItemSearch from "@/components/inventory-item-search/InventoryItemSearch";
import ProductSearch from "@/components/product-search/ProductSearch";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ComponentMode } from "@/lib/component-mode";

type Props = {
    itemId: number | null;
    name: string;
    hasUnsavedChanges: boolean;
    onItemSelect: (code: string) => void;
    onProductSelect: (code: string) => void;
};

export default function InventoryItemRelatedData({
    itemId,
    name,
    hasUnsavedChanges,
    onItemSelect,
    onProductSelect,
}: Props) {
    if (itemId == null || hasUnsavedChanges || !name.trim()) return null;
    return (
        <Accordion className="mt-6">
            <AccordionItem value="similar-inventory-items">
                <AccordionTrigger>Similar inventory items</AccordionTrigger>
                <AccordionContent keepMounted>
                    <InventoryItemSearch
                        showSearchFields={false}
                        similarName={name}
                        onInventoryItemSelect={(item) => {
                            if (item.productCode)
                                onItemSelect(item.productCode);
                        }}
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
