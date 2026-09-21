import ProductSearch from '@/components/product-search/ProductSearch'
import { ComponentMode } from '@/lib/component-mode'

function ProductSearchPage() {
    return <ProductSearch mode={ComponentMode.Page} />
}

export default ProductSearchPage
