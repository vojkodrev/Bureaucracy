import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { emptyToNull } from '@/lib/form-input'
import type { Product } from '@/lib/product-types'
import { nextPaddedNumber, numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import ProductDetails from './ProductDetails'
import ProductErrors from './ProductErrors'
import ProductMenu from './ProductMenu'
import ProductPricing from './ProductPricing'
import UnsavedProductAlerts from './UnsavedProductAlerts'

type ProductResponse = { data?: { product: Product | null }; errors?: { message: string }[] }
type SaveProductResponse = { data?: { saveProduct: Product }; errors?: { message: string }[] }
type LatestProductResponse = {
    data?: { searchProducts: { products: Pick<Product, 'productCode'>[] } }
    errors?: { message: string }[]
}
type LoadResult = { requestKey: string; error: string | null }

type ProductDraft = {
    productCode: string
    name: string
    unit: string
    netPrice: string
    taxRate: string
    taxCode: string
}

const productQuery = `
    query Product($businessYear: String!, $productCode: String!) {
        product(businessYear: $businessYear, productCode: $productCode) {
            id productCode name barcode unit netPrice grossPrice taxRate taxCode
        }
    }
`
const latestProductQuery = `
    query LatestProduct($businessYear: String!) {
        searchProducts(businessYear: $businessYear, sortBy: "productCode", sortDirection: "desc", page: 1, pageSize: 1) {
            products { productCode }
        }
    }
`
const saveProductMutation = `
    mutation SaveProduct($businessYear: String!, $product: ProductInput!) {
        saveProduct(businessYear: $businessYear, product: $product) {
            id productCode name barcode unit netPrice grossPrice taxRate taxCode
        }
    }
`
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function productDraft(product?: Product | null): ProductDraft {
    return {
        productCode: product?.productCode ?? '',
        name: product?.name ?? '',
        unit: product?.unit ?? '',
        netPrice: product?.netPrice == null ? '' : String(product.netPrice),
        taxRate: product?.taxRate == null ? '' : String(product.taxRate),
        taxCode: product?.taxCode ?? '',
    }
}

function isOptionalNonNegativeNumber(value: string): boolean {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isFinite(number) && number >= 0
}

function calculateGrossPrice(netPrice: string, taxRate: string): string {
    const net = numberOrNull(netPrice)
    const tax = numberOrNull(taxRate)
    if (net == null || tax == null) return ''
    return (net * (1 + tax / 100)).toFixed(2)
}

async function fetchNextProductCode(signal?: AbortSignal): Promise<string> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: latestProductQuery,
            variables: { businessYear: getSelectedBusinessYear() },
        }),
        signal,
    })
    if (!response.ok) throw new Error(`Loading latest product failed (${response.status})`)

    const result = await response.json() as LatestProductResponse
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return nextPaddedNumber(result.data?.searchProducts.products[0]?.productCode, 4)
}

function ProductPage() {
    const { productCode: routeProductCode } = useParams()
    const navigate = useNavigate()
    const preserveDuplicateRef = useRef(false)
    const allowNextNavigationRef = useRef(false)
    const [productId, setProductId] = useState<number | null>(null)
    const [draft, setDraft] = useState<ProductDraft>(() => productDraft())
    const [cleanDraft, setCleanDraft] = useState(JSON.stringify(productDraft()))
    const [reloadVersion, setReloadVersion] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [isDuplicating, setIsDuplicating] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const [confirmingDuplicate, setConfirmingDuplicate] = useState(false)
    const requestKey = `${routeProductCode ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState<LoadResult>({ requestKey: '__initial__', error: null })
    const isLoading = Boolean(routeProductCode) && loadResult.requestKey !== requestKey
    const loadError = loadResult.requestKey === requestKey ? loadResult.error : null
    const hasUnsavedChanges = JSON.stringify(draft) !== cleanDraft
    const grossPrice = calculateGrossPrice(draft.netPrice, draft.taxRate)
    const canSave = Boolean(draft.productCode.trim() && draft.name.trim()) &&
        isOptionalNonNegativeNumber(draft.netPrice) &&
        isOptionalNonNegativeNumber(draft.taxRate) &&
        !isLoading &&
        !isDuplicating &&
        !loadError
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNextNavigationRef.current && hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search ||
            currentLocation.hash !== nextLocation.hash),
    )

    useEffect(() => {
        if (!routeProductCode) {
            if (preserveDuplicateRef.current) {
                preserveDuplicateRef.current = false
                allowNextNavigationRef.current = false
                setLoadResult({ requestKey, error: null })
                return
            }

            const emptyDraft = productDraft()
            setProductId(null)
            setDraft(emptyDraft)
            setCleanDraft(JSON.stringify(emptyDraft))
            setSaveError(null)
            setLoadResult({ requestKey, error: null })
            allowNextNavigationRef.current = false

            const abortController = new AbortController()
            void fetchNextProductCode(abortController.signal).then((nextProductCode) => {
                const newDraft = { ...emptyDraft, productCode: nextProductCode }
                setDraft(newDraft)
                setCleanDraft(JSON.stringify(newDraft))
            }).catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) console.error(requestError)
            })
            return () => abortController.abort()
        }

        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: productQuery,
                variables: { businessYear: getSelectedBusinessYear(), productCode: routeProductCode },
            }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading product failed (${response.status})`)
            const result = await response.json() as ProductResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.product) throw new Error(`Product ${routeProductCode} was not found`)
            const loadedDraft = productDraft(result.data.product)
            setProductId(result.data.product.id)
            setDraft(loadedDraft)
            setCleanDraft(JSON.stringify(loadedDraft))
            setLoadResult({ requestKey, error: null })
            allowNextNavigationRef.current = false
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setLoadResult({
                requestKey,
                error: requestError instanceof Error ? requestError.message : 'Loading product failed',
            })
        })
        return () => abortController.abort()
    }, [requestKey, routeProductCode])

    const setField = (field: keyof ProductDraft, value: string) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }

    const saveProduct = async () => {
        if (!canSave || isSaving) return
        const isCreating = productId == null
        setIsSaving(true)
        setSaveError(null)
        try {
            const response = await fetch(graphqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: saveProductMutation,
                    variables: {
                        businessYear: getSelectedBusinessYear(),
                        product: {
                            id: productId,
                            productCode: draft.productCode.trim(),
                            name: emptyToNull(draft.name),
                            unit: emptyToNull(draft.unit),
                            netPrice: numberOrNull(draft.netPrice),
                            grossPrice: numberOrNull(grossPrice),
                            taxRate: numberOrNull(draft.taxRate),
                            taxCode: emptyToNull(draft.taxCode),
                        },
                    },
                }),
            })
            if (!response.ok) throw new Error(`Saving product failed (${response.status})`)
            const result = await response.json() as SaveProductResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.saveProduct) throw new Error('Saving product returned no product')
            const savedProduct = result.data.saveProduct
            const savedDraft = productDraft(savedProduct)
            setProductId(savedProduct.id)
            setDraft(savedDraft)
            setCleanDraft(JSON.stringify(savedDraft))
            toast.add({
                title: 'Product saved',
                description: `${savedProduct.productCode} was ${isCreating ? 'created' : 'updated'} successfully.`,
                type: 'success',
            })
            if (routeProductCode === savedProduct.productCode) {
                setReloadVersion((version) => version + 1)
            } else {
                allowNextNavigationRef.current = true
                navigate(`/product/${encodeURIComponent(savedProduct.productCode ?? '')}`)
            }
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Saving product failed')
        } finally {
            setIsSaving(false)
        }
    }

    const performRevert = () => {
        setConfirmingRevert(false)
        setSaveError(null)
        if (routeProductCode) {
            setReloadVersion((version) => version + 1)
        } else {
            const emptyDraft = productDraft()
            setDraft(emptyDraft)
            setCleanDraft(JSON.stringify(emptyDraft))
        }
        toast.add({
            title: 'Product reverted',
            description: routeProductCode
                ? `${routeProductCode} was restored to its last saved version.`
                : 'The new product form was cleared.',
            type: 'success',
        })
    }

    const duplicateProduct = async () => {
        if (productId == null || isDuplicating) return

        if (hasUnsavedChanges) {
            setConfirmingDuplicate(true)
            return
        }

        await performDuplicateProduct()
    }

    const performDuplicateProduct = async () => {
        if (productId == null || isDuplicating) return
        setConfirmingDuplicate(false)
        setIsDuplicating(true)
        setSaveError(null)
        try {
            const nextProductCode = await fetchNextProductCode()
            setProductId(null)
            setDraft((current) => ({ ...current, productCode: nextProductCode }))
            setCleanDraft('__unsaved_duplicate__')
            preserveDuplicateRef.current = true
            allowNextNavigationRef.current = true
            navigate('/product')
            toast.add({
                title: 'Product duplicated',
                description: `Product code ${nextProductCode} has been assigned to the new unsaved copy. ` +
                    'You can review and edit it before saving.',
                type: 'info',
            })
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Duplicating product failed')
        } finally {
            setIsDuplicating(false)
        }
    }

    const onSaveShortcut = useEffectEvent(() => { void saveProduct() })
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
            event.preventDefault()
            onSaveShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault() }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    return (
        <div className="max-w-5xl p-4">
            <ProductErrors loadError={loadError} saveError={saveError} />
            <ProductMenu
                canSave={canSave}
                canRevert={hasUnsavedChanges && !isDuplicating}
                canDuplicate={productId != null && !isLoading && !isSaving}
                isSaving={isSaving}
                isDuplicating={isDuplicating}
                onSave={() => void saveProduct()}
                onRevert={() => setConfirmingRevert(true)}
                onDuplicate={() => void duplicateProduct()}
            />
            <UnsavedProductAlerts
                isNavigationBlocked={blocker.state === 'blocked'}
                isConfirmingRevert={confirmingRevert}
                isConfirmingDuplicate={confirmingDuplicate}
                onCancelNavigation={() => { if (blocker.state === 'blocked') blocker.reset() }}
                onDiscardAndNavigate={() => {
                    if (blocker.state !== 'blocked') return
                    allowNextNavigationRef.current = true
                    setCleanDraft(JSON.stringify(draft))
                    blocker.proceed()
                }}
                onConfirmingRevertChange={setConfirmingRevert}
                onDiscardAndRevert={performRevert}
                onConfirmingDuplicateChange={setConfirmingDuplicate}
                onDuplicateAnyway={() => void performDuplicateProduct()}
            />
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <ProductDetails productCode={draft.productCode} name={draft.name} unit={draft.unit}
                    onProductCodeChange={(value) => setField('productCode', value)}
                    onNameChange={(value) => setField('name', value)}
                    onUnitChange={(value) => setField('unit', value)} />
                <ProductPricing netPrice={draft.netPrice} grossPrice={grossPrice}
                    taxRate={draft.taxRate} taxCode={draft.taxCode}
                    onNetPriceChange={(value) => setField('netPrice', value)}
                    onTaxChange={(code, rate) => setDraft((current) => ({
                        ...current,
                        taxCode: code,
                        taxRate: rate == null ? '' : String(rate),
                    }))} />
            </div>
        </div>
    )
}

export default ProductPage
