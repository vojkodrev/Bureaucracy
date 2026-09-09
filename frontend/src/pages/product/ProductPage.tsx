import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import TaxCodeComboboxField from '@/components/TaxCodeComboboxField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { emptyToNull } from '@/lib/form-input'
import type { Product } from '@/lib/product-types'
import { numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import ProductMenu from './ProductMenu'
import UnsavedProductAlert from './UnsavedProductAlert'

type ProductResponse = { data?: { product: Product | null }; errors?: { message: string }[] }
type SaveProductResponse = { data?: { saveProduct: Product }; errors?: { message: string }[] }
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

function ProductPage() {
    const { productCode: routeProductCode } = useParams()
    const navigate = useNavigate()
    const allowNextNavigationRef = useRef(false)
    const [productId, setProductId] = useState<number | null>(null)
    const [draft, setDraft] = useState<ProductDraft>(() => productDraft())
    const [cleanDraft, setCleanDraft] = useState(JSON.stringify(productDraft()))
    const [reloadVersion, setReloadVersion] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [confirmingRevert, setConfirmingRevert] = useState(false)
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
        !loadError
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNextNavigationRef.current && hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search ||
            currentLocation.hash !== nextLocation.hash),
    )

    useEffect(() => {
        if (!routeProductCode) {
            const emptyDraft = productDraft()
            setProductId(null)
            setDraft(emptyDraft)
            setCleanDraft(JSON.stringify(emptyDraft))
            setSaveError(null)
            setLoadResult({ requestKey, error: null })
            allowNextNavigationRef.current = false
            return
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
            <ProductMenu
                canSave={canSave}
                canRevert={hasUnsavedChanges}
                isSaving={isSaving}
                onSave={() => void saveProduct()}
                onRevert={() => setConfirmingRevert(true)}
            />
            <UnsavedProductAlert
                open={blocker.state === 'blocked'}
                onOpenChange={(open) => { if (!open && blocker.state === 'blocked') blocker.reset() }}
                onDiscard={() => {
                    if (blocker.state !== 'blocked') return
                    allowNextNavigationRef.current = true
                    setCleanDraft(JSON.stringify(draft))
                    blocker.proceed()
                }}
            />
            <UnsavedProductAlert
                open={confirmingRevert}
                onOpenChange={setConfirmingRevert}
                onDiscard={performRevert}
                actionLabel="Discard and revert"
            />
            {loadError && <p className="mb-6 text-sm text-destructive" role="alert">{loadError}</p>}
            {saveError && <p className="mb-6 text-sm text-destructive" role="alert">{saveError}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Product details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="product-code">Product code</FieldLabel>
                                <Input id="product-code" maxLength={25} required value={draft.productCode} onChange={(event) => setField('productCode', event.target.value)} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-name">Name</FieldLabel>
                                <Input id="product-name" maxLength={100} required value={draft.name} onChange={(event) => setField('name', event.target.value)} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-unit">Unit</FieldLabel>
                                <Input id="product-unit" maxLength={10} value={draft.unit} onChange={(event) => setField('unit', event.target.value)} />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="product-net-price">Net price</FieldLabel>
                                <NumberInput id="product-net-price" min="0" step="0.01" value={draft.netPrice} onChange={(event) => setField('netPrice', event.target.value)} />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="product-gross-price">Gross price</FieldLabel>
                                <NumberInput id="product-gross-price" min="0" step="0.01" value={grossPrice} disabled />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <TaxCodeComboboxField
                                    id="product-tax-code"
                                    label="Tax code"
                                    value={draft.taxCode}
                                    onChange={(code, rate) => setDraft((current) => ({
                                        ...current,
                                        taxCode: code,
                                        taxRate: rate == null ? '' : String(rate),
                                    }))}
                                />
                                <Field>
                                    <FieldLabel htmlFor="product-tax-rate">Tax rate</FieldLabel>
                                    <NumberInput id="product-tax-rate" min="0" step="0.01" value={draft.taxRate} disabled />
                                </Field>
                            </div>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ProductPage
