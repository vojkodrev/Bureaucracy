import { useState } from 'react'
import type { Product } from '@/lib/product-types'

export function useProductSearchSelection(onProductSelect?: (product: Product) => void) {
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

    function selectProduct(product: Product) {
        setSelectedProductId(product.id)
        onProductSelect?.(product)
    }

    function clearSelection() {
        setSelectedProductId(null)
    }

    return { selectedProductId, selectProduct, clearSelection }
}
