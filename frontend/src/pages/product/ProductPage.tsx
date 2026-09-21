import { useNavigate, useParams } from 'react-router-dom'
import ProductDetails from './ProductDetails'
import ProductErrors from './ProductErrors'
import ProductMenu from './ProductMenu'
import ProductPricing from './ProductPricing'
import UnsavedProductAlerts from './UnsavedProductAlerts'
import { useProductDraft } from './hooks/useProductDraft'
import { useProductDuplicate } from './hooks/useProductDuplicate'
import { useProductKeyboardShortcuts } from './hooks/useProductKeyboardShortcuts'
import { useProductLoader } from './hooks/useProductLoader'
import { useProductRevert } from './hooks/useProductRevert'
import { useProductSave } from './hooks/useProductSave'
import { useUnsavedProductGuard } from './hooks/useUnsavedProductGuard'

function ProductPage() {
    const { productCode: routeProductCode } = useParams()
    const navigate = useNavigate()
    const draftState = useProductDraft()
    const { draft, setDraft, setField } = draftState
    const guard = useUnsavedProductGuard(draftState.hasUnsavedChanges)
    const loader = useProductLoader({
        routeProductCode, replaceDraft: setDraft, markClean: draftState.markClean,
        disallowNavigation: guard.disallowNavigation,
    })
    const duplicate = useProductDuplicate({
        productId: loader.productId, hasUnsavedChanges: draftState.hasUnsavedChanges,
        navigate, setProductId: loader.setProductId, replaceDraft: setDraft,
        markUnsaved: draftState.markUnsaved, preserveDuplicateDraft: loader.preserveDuplicateDraft,
        allowNavigation: guard.allowNavigation,
    })
    const save = useProductSave({
        productId: loader.productId, draft, grossPrice: draftState.grossPrice,
        routeProductCode, isLoading: loader.isLoading, loadError: loader.error,
        isDuplicating: duplicate.isDuplicating, navigate, replaceDraft: setDraft,
        markClean: draftState.markClean, setProductId: loader.setProductId,
        clearDuplicateError: () => duplicate.setDuplicateError(null),
        allowNavigation: guard.allowNavigation, reloadAfterSave: loader.reloadAfterSave,
    })
    const revert = useProductRevert({
        routeProductCode, hasUnsavedChanges: draftState.hasUnsavedChanges,
        isDuplicating: duplicate.isDuplicating, clearSaveError: () => save.setSaveError(null),
        clearDuplicateError: () => duplicate.setDuplicateError(null),
        replaceDraft: setDraft, markClean: draftState.markClean, reload: loader.reload,
    })
    useProductKeyboardShortcuts(() => { void save.saveProduct() })

    return (
        <div className="max-w-5xl p-4">
            <ProductErrors loadError={loader.error}
                saveError={save.saveError ?? duplicate.duplicateError} />
            <ProductMenu
                canSave={save.canSave}
                canRevert={revert.canRevert}
                canDuplicate={loader.productId != null && !loader.isLoading && !save.isSaving}
                isSaving={save.isSaving}
                isDuplicating={duplicate.isDuplicating}
                onSave={() => { void save.saveProduct() }}
                onRevert={revert.requestRevert}
                onDuplicate={() => { void duplicate.duplicate() }}
            />
            <UnsavedProductAlerts
                isNavigationBlocked={guard.blocker.state === 'blocked'}
                isConfirmingRevert={revert.confirmingRevert}
                isConfirmingDuplicate={duplicate.confirmingDuplicate}
                onCancelNavigation={() => {
                    if (guard.blocker.state === 'blocked') guard.blocker.reset()
                }}
                onDiscardAndNavigate={guard.discardAndNavigate}
                onConfirmingRevertChange={revert.setConfirmingRevert}
                onDiscardAndRevert={revert.performRevert}
                onConfirmingDuplicateChange={duplicate.setConfirmingDuplicate}
                onDuplicateAnyway={() => { void duplicate.performDuplicate() }}
            />
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <ProductDetails productCode={draft.productCode} name={draft.name} unit={draft.unit}
                    onProductCodeChange={(value) => setField('productCode', value)}
                    onNameChange={(value) => setField('name', value)}
                    onUnitChange={(value) => setField('unit', value)} />
                <ProductPricing netPrice={draft.netPrice} grossPrice={draftState.grossPrice}
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
