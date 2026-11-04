import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import CustomerInputFields from '../invoice/CustomerInputFields'
import Products from '../invoice/Products'
import DeliveryNoteAlert from './DeliveryNoteAlert'
import DeliveryNoteGeneralInformation from './DeliveryNoteGeneralInformation'
import DeliveryNoteMenu from './DeliveryNoteMenu'
import DeliveryNoteNumberAlert from './DeliveryNoteNumberAlert'
import DeliveryNoteSummary from './DeliveryNoteSummary'
import { useDeliveryNoteDraft } from './hooks/useDeliveryNoteDraft'
import { useDeliveryNoteDuplicate } from './hooks/useDeliveryNoteDuplicate'
import { useDeliveryNoteInvoiceConversion } from './hooks/useDeliveryNoteInvoiceConversion'
import { useDeliveryNoteKeyboardShortcuts } from './hooks/useDeliveryNoteKeyboardShortcuts'
import { useDeliveryNoteLoader } from './hooks/useDeliveryNoteLoader'
import { useDeliveryNoteNumberNavigation } from './hooks/useDeliveryNoteNumberNavigation'
import { useDeliveryNotePrint } from './hooks/useDeliveryNotePrint'
import { useDeliveryNoteRevert } from './hooks/useDeliveryNoteRevert'
import { useDeliveryNoteSave } from './hooks/useDeliveryNoteSave'
import { useUnsavedDeliveryNoteGuard } from './hooks/useUnsavedDeliveryNoteGuard'

export default function DeliveryNotePage() {
    const { deliveryNoteNumber: routeNumber } = useParams()
    const navigate = useNavigate()
    const draftState = useDeliveryNoteDraft()
    const { draft, setDraft, setField } = draftState
    const guard = useUnsavedDeliveryNoteGuard(
        draftState.hasUnsavedChanges,
    )
    const loader = useDeliveryNoteLoader({
        routeNumber,
        replaceDraft: setDraft,
        markClean: draftState.markClean,
        clearCleanDraft: draftState.clearCleanDraft,
        disallowNavigation: guard.disallowNavigation,
    })
    const navigation = useDeliveryNoteNumberNavigation(
        routeNumber,
        navigate,
    )
    const invoiceConversion = useDeliveryNoteInvoiceConversion({
        draft,
        businessYear: loader.businessYear,
        navigate,
        allowNavigation: guard.allowNavigation,
    })
    const save = useDeliveryNoteSave({
        deliveryNoteId: loader.deliveryNoteId,
        draft,
        routeNumber,
        isLoading: loader.isLoading,
        loadError: loader.error,
        navigate,
        markClean: draftState.markClean,
        allowNavigation: guard.allowNavigation,
        reloadAfterSave: loader.reloadAfterSave,
    })
    const duplicate = useDeliveryNoteDuplicate({
        deliveryNoteId: loader.deliveryNoteId,
        businessYear: loader.businessYear,
        draft,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        navigate,
        replaceDraft: setDraft,
        markUnsaved: draftState.markUnsaved,
        setDeliveryNoteId: loader.setDeliveryNoteId,
        setBusinessYear: loader.setBusinessYear,
        setRequestErrors: loader.setRequestErrors,
        preserveDuplicateDraft: loader.preserveDuplicateDraft,
        allowNavigation: guard.allowNavigation,
    })
    const print = useDeliveryNotePrint({
        deliveryNoteId: loader.deliveryNoteId,
        deliveryNoteNumber: draft.deliveryNoteNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        loadError: loader.error,
        isSaving: save.isSaving,
        isDuplicating: duplicate.isDuplicating,
        canSave: save.canSave,
    })
    const revert = useDeliveryNoteRevert({
        routeNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        isSaving: save.isSaving,
        isDuplicating: duplicate.isDuplicating,
        clearErrors: () => {
            save.setSaveError(null)
            print.setPrintError(null)
        },
        reload: loader.reload,
    })
    useDeliveryNoteKeyboardShortcuts(
        () => { void save.requestSave() },
        print.printDeliveryNote,
    )

    const errors = [
        [
            'load',
            'Delivery note could not be loaded',
            'The delivery note data could not be retrieved.',
            loader.error,
        ],
        [
            'save',
            'Delivery note could not be saved',
            'Your changes were not saved.',
            save.saveError,
        ],
        [
            'print',
            'Delivery note could not be printed',
            'The PDF could not be prepared.',
            print.printError,
        ],
        [
            'navigation',
            'Latest delivery note could not be loaded',
            'Number navigation may be unavailable.',
            navigation.error,
        ],
        [
            'next',
            'Next delivery note number could not be loaded',
            'Enter the delivery note number manually.',
            loader.requestErrors.nextNumber,
        ],
        [
            'template',
            'Delivery note text template could not be loaded',
            'The new note was opened without default text.',
            loader.requestErrors.textTemplate,
        ],
        [
            'year',
            'Business year could not be loaded',
            'Business-year details are unavailable.',
            loader.requestErrors.businessYear,
        ],
        [
            'duplicate',
            'Delivery note could not be duplicated',
            'The duplicate draft could not be prepared.',
            loader.requestErrors.currentBusinessYear,
        ],
        [
            'convert',
            'Delivery note could not be converted',
            'The invoice draft could not be prepared.',
            invoiceConversion.error,
        ],
    ] as const

    return (
        <div className="max-w-6xl p-4">
            {errors.some(([, , , error]) => error) && (
                <div className="mb-6 space-y-2">
                    {errors.map(([key, title, description, error]) => (
                        error && (
                            <ErrorAlert
                                key={key}
                                title={title}
                                description={description}
                                error={error}
                            />
                        )
                    ))}
                </div>
            )}
            <div className="mb-6 flex items-center gap-2">
                <DeliveryNoteMenu
                    canSave={save.canSave}
                    canPrint={print.canRequestPrint}
                    canRevert={revert.canRevert}
                    canDuplicate={
                        loader.deliveryNoteId != null
                        && !loader.isLoading
                        && !save.isSaving
                    }
                    isSaving={save.isSaving}
                    isDuplicating={duplicate.isDuplicating}
                    onSave={() => { void save.requestSave() }}
                    onPrint={print.printDeliveryNote}
                    onRevert={revert.requestRevert}
                    onDuplicate={() => { void duplicate.duplicate() }}
                    onConvertToInvoice={invoiceConversion.convertToInvoice}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous delivery note"
                    disabled={!navigation.canNavigatePrevious}
                    onClick={navigation.navigatePrevious}
                >
                    <ChevronLeft />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next delivery note"
                    disabled={!navigation.canNavigateNext}
                    onClick={navigation.navigateNext}
                >
                    <ChevronRight />
                </Button>
            </div>

            <DeliveryNoteNumberAlert
                number={draft.deliveryNoteNumber.trim()}
                warning={save.numberWarning}
                onOpenChange={(open) => {
                    if (!open) save.setNumberWarning(null)
                }}
                onConfirm={() => { void save.confirmSave() }}
            />
            <DeliveryNoteAlert
                open={guard.blocker.state === 'blocked'}
                onOpenChange={(open) => {
                    if (!open && guard.blocker.state === 'blocked') {
                        guard.blocker.reset()
                    }
                }}
                onAction={guard.discardAndNavigate}
                actionLabel="Leave without saving"
                title="Discard unsaved changes?"
                description="This delivery note has unsaved changes."
            />
            <DeliveryNoteAlert
                open={revert.confirmingRevert}
                onOpenChange={revert.setConfirmingRevert}
                onAction={revert.performRevert}
                actionLabel="Discard and revert"
                title="Revert delivery note?"
                description="All unsaved changes will be discarded."
            />
            <DeliveryNoteAlert
                open={duplicate.confirmingDuplicate}
                onOpenChange={duplicate.setConfirmingDuplicate}
                onAction={() => { void duplicate.performDuplicate() }}
                actionLabel="Duplicate anyway"
                title="Duplicate with unsaved changes?"
                description="The duplicate will include the values currently shown."
            />
            <DeliveryNoteAlert
                open={print.confirmingPrint}
                onOpenChange={print.setConfirmingPrint}
                onAction={() => {
                    print.setConfirmingPrint(false)
                    void save.requestSave()
                }}
                actionLabel="Save delivery note"
                actionVariant="default"
                title="Save before printing?"
                description="Save first so the PDF matches the current values."
            />

            <div className="grid items-start gap-6 lg:grid-cols-2">
                <CustomerInputFields
                    customerId={draft.customerId}
                    customerName={draft.customerName}
                    customerAddress={draft.customerAddress}
                    customerPostalCode={draft.customerPostalCode}
                    customerCity={draft.customerCity}
                    customerCountry={draft.customerCountry}
                    onCustomerIdChange={(value) => {
                        setField('customerId', value)
                    }}
                    onCustomerNameChange={(value) => {
                        setField('customerName', value)
                    }}
                    onCustomerAddressChange={(value) => {
                        setField('customerAddress', value)
                    }}
                    onCustomerPostalCodeChange={(value) => {
                        setField('customerPostalCode', value)
                    }}
                    onCustomerCityChange={(value) => {
                        setField('customerCity', value)
                    }}
                    onCustomerCountryChange={(value) => {
                        setField('customerCountry', value)
                    }}
                    onCustomerPaymentTermChange={() => {}}
                />
                <DeliveryNoteGeneralInformation
                    deliveryNoteNumber={draft.deliveryNoteNumber}
                    businessYear={loader.businessYear}
                    issueDate={draft.issueDate}
                    deliveryDate={draft.deliveryDate}
                    withoutAmounts={draft.withoutAmounts}
                    onNumberChange={(value) => {
                        setField('deliveryNoteNumber', value)
                    }}
                    onIssueDateChange={(value) => {
                        setField('issueDate', value)
                    }}
                    onDeliveryDateChange={(value) => {
                        setField('deliveryDate', value)
                    }}
                    onWithoutAmountsChange={(value) => {
                        setField('withoutAmounts', value)
                    }}
                />
            </div>
            <div className="mt-8 space-y-6">
                <Field>
                    <FieldLabel htmlFor="delivery-note-introductory-text">
                        Introductory text
                    </FieldLabel>
                    <Textarea
                        id="delivery-note-introductory-text"
                        value={draft.introductoryText}
                        onChange={(event) => {
                            setField('introductoryText', event.target.value)
                        }}
                    />
                </Field>
                <Products
                    items={draft.items}
                    isLoading={loader.isLoading}
                    onItemsChange={draftState.setItems}
                    documentName="delivery note"
                />
                <Field>
                    <FieldLabel htmlFor="delivery-note-closing-text">
                        Closing text
                    </FieldLabel>
                    <Textarea
                        id="delivery-note-closing-text"
                        value={draft.closingText}
                        onChange={(event) => {
                            setField('closingText', event.target.value)
                        }}
                    />
                </Field>
                <DeliveryNoteSummary
                    total={draftState.totalIncludingVat}
                    withoutAmounts={draft.withoutAmounts}
                />
            </div>
        </div>
    )
}
