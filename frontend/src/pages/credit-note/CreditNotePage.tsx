import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmailDocumentDialog from '@/components/EmailDocumentDialog'
import ErrorAlert from '@/components/ErrorAlert'
import WarningAlert from '@/components/WarningAlert'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { sendDocumentEmail } from '@/lib/document-email'
import { dateAfterDays } from '@/lib/dates'
import { toast } from '@/lib/toast'
import CustomerInputFields from '../invoice/CustomerInputFields'
import Products from '../invoice/Products'
import PriceQuoteSummary from '../price-quote/PriceQuoteSummary'
import CreditNoteGeneralInformation from './CreditNoteGeneralInformation'
import CreditNoteMenu from './CreditNoteMenu'
import UnsavedCreditNoteAlerts from './UnsavedCreditNoteAlerts'
import { useCreditNoteDraft } from './hooks/useCreditNoteDraft'
import { useCreditNoteKeyboardShortcuts } from './hooks/useCreditNoteKeyboardShortcuts'
import { useCreditNoteLoader } from './hooks/useCreditNoteLoader'
import { useCreditNotePrint } from './hooks/useCreditNotePrint'
import { useCreditNoteRevert } from './hooks/useCreditNoteRevert'
import { useCreditNoteSave } from './hooks/useCreditNoteSave'
import { useUnsavedCreditNoteGuard } from './hooks/useUnsavedCreditNoteGuard'

export default function CreditNotePage() {
    const { creditNoteNumber: routeNumber } = useParams()
    const navigate = useNavigate()
    const draftState = useCreditNoteDraft()
    const { draft, setField } = draftState
    const guard = useUnsavedCreditNoteGuard(draftState.hasUnsavedChanges)
    const loader = useCreditNoteLoader({
        routeNumber,
        replaceDraft: draftState.setDraft,
        markClean: draftState.markClean,
        clearCleanDraft: draftState.clearCleanDraft,
        disallowNavigation: guard.disallowNavigation,
    })
    const save = useCreditNoteSave({
        creditNoteId: loader.creditNoteId,
        draft,
        routeNumber,
        isLoading: loader.isLoading,
        loadError: loader.error,
        navigate,
        markClean: draftState.markClean,
        reload: loader.reload,
        allowNavigation: guard.allowNavigation,
    })
    const [emailOpen, setEmailOpen] = useState(false)
    const [confirmingUnsavedEmail, setConfirmingUnsavedEmail] = useState(false)
    const print = useCreditNotePrint({
        creditNoteId: loader.creditNoteId,
        number: draft.creditNoteNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        loadError: loader.error,
        isSaving: save.isSaving,
        canSave: save.canSave,
    })
    const revert = useCreditNoteRevert({
        routeNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        isSaving: save.isSaving,
        clearSaveError: () => save.setSaveError(null),
        clearPrintError: () => print.setPrintError(null),
        reload: loader.reload,
    })
    useCreditNoteKeyboardShortcuts(
        () => { void save.save() },
        () => { void print.printCreditNote() },
    )
    const errors = [
        [
            'credit-note',
            'Credit note could not be loaded',
            'The credit note data could not be retrieved.',
            loader.error,
        ],
        [
            'print',
            'Credit note could not be printed',
            'The credit note PDF could not be prepared.',
            print.printError,
        ],
        [
            'save',
            'Credit note could not be saved',
            'Your changes were not saved.',
            save.saveError,
        ],
        [
            'next',
            'Next credit note number could not be loaded',
            'A number could not be assigned to the new credit note.',
            loader.requestErrors.nextCreditNoteNumber,
        ],
        [
            'year',
            'Business year could not be loaded',
            'The credit note business-year details are unavailable.',
            loader.requestErrors.businessYear,
        ],
        [
            'text-template',
            'Credit note text template could not be loaded',
            'The introductory and closing text defaults are unavailable.',
            loader.requestErrors.textTemplate,
        ],
    ] as const
    const warnings = [
        [
            'credit-note-total',
            'Credit note total is inconsistent',
            'The stored credit note total does not equal the sum of its lines.',
            'Review and save the credit note to correct its total.',
        ],
        [
            'credit-note-line-total',
            'Credit note line total is inconsistent',
            'At least one line gross amount does not equal its net amount plus VAT.',
            'Review and save the credit note lines to correct their totals.',
        ],
    ] as const
    const hasWarnings = warnings.some(([key]) => loader.warnings.includes(key))

    return (
        <div className="max-w-6xl p-4">
            {(errors.some(([, , , error]) => error) || hasWarnings) && (
                <div className="mb-6 space-y-2">
                    {errors.map(([key, title, description, error]) => error && (
                        <ErrorAlert
                            key={key}
                            title={title}
                            description={description}
                            error={error}
                        />
                    ))}
                    {warnings.map(([key, title, description, warning]) =>
                        loader.warnings.includes(key) && (
                            <WarningAlert
                                key={key}
                                title={title}
                                description={description}
                                warning={warning}
                            />
                        ))}
                </div>
            )}
            <div className="mb-6">
                <CreditNoteMenu
                    canSave={save.canSave}
                    canPrint={print.canRequestPrint}
                    canRevert={revert.canRevert}
                    isSaving={save.isSaving}
                    onSave={() => { void save.save() }}
                    onPrint={() => { void print.printCreditNote() }}
                    onEmail={() => {
                        if (print.canPrint) setEmailOpen(true)
                        else if (save.canSave) setConfirmingUnsavedEmail(true)
                    }}
                    onRevert={revert.requestRevert}
                />
            </div>
            <EmailDocumentDialog
                open={emailOpen}
                documentName="credit note"
                customerId={draft.customerId}
                customerName={draft.customerName}
                businessYear={loader.businessYear}
                defaultSubject={`Drevi d.o.o. - Dobropis ${draft.creditNoteNumber}`}
                defaultMessage={
                    `Pozdravljeni,\n\nv priponki vam pošiljamo dobropis ` +
                    `${draft.creditNoteNumber}.\n\n` +
                    'Lep pozdrav, Drevi d.o.o. 041 693 605'
                }
                onSend={async (fields) => {
                    await sendDocumentEmail(
                        'credit-notes',
                        draft.creditNoteNumber.trim(),
                        fields,
                    )
                    toast.add({
                        title: 'Credit note emailed',
                        description: `Credit note was sent to ${fields.recipient}.`,
                        type: 'success',
                    })
                }}
                onOpenChange={setEmailOpen}
            />
            <UnsavedCreditNoteAlerts
                isNavigationBlocked={guard.blocker.state === 'blocked'}
                isConfirmingRevert={revert.confirmingRevert}
                isConfirmingPrint={print.confirmingPrint}
                isConfirmingEmail={confirmingUnsavedEmail}
                onCancelNavigation={() => {
                    if (guard.blocker.state === 'blocked') guard.blocker.reset()
                }}
                onDiscardAndNavigate={guard.discardAndNavigate}
                onConfirmingRevertChange={revert.setConfirmingRevert}
                onDiscardAndRevert={revert.performRevert}
                onConfirmingPrintChange={print.setConfirmingPrint}
                onSaveBeforePrint={() => {
                    print.setConfirmingPrint(false)
                    void save.save()
                }}
                onConfirmingEmailChange={setConfirmingUnsavedEmail}
                onSaveBeforeEmail={() => {
                    setConfirmingUnsavedEmail(false)
                    void save.save()
                }}
            />
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <CustomerInputFields
                    customerId={draft.customerId}
                    customerName={draft.customerName}
                    customerAddress={draft.customerAddress}
                    customerPostalCode={draft.customerPostalCode}
                    customerCity={draft.customerCity}
                    customerCountry={draft.customerCountry}
                    onCustomerIdChange={(value) => setField('customerId', value)}
                    onCustomerNameChange={(value) => setField('customerName', value)}
                    onCustomerAddressChange={(value) => setField('customerAddress', value)}
                    onCustomerPostalCodeChange={(value) => setField('customerPostalCode', value)}
                    onCustomerCityChange={(value) => setField('customerCity', value)}
                    onCustomerCountryChange={(value) => setField('customerCountry', value)}
                    onCustomerPaymentTermChange={(term) => setField(
                        'dueDate',
                        dateAfterDays(draft.issueDate, term),
                    )}
                />
                <CreditNoteGeneralInformation
                    number={draft.creditNoteNumber}
                    businessYear={loader.businessYear}
                    issueDate={draft.issueDate}
                    serviceDate={draft.serviceDate}
                    dueDate={draft.dueDate}
                    onNumberChange={(value) => setField('creditNoteNumber', value)}
                    onIssueDateChange={(value) => setField('issueDate', value)}
                    onServiceDateChange={(value) => setField('serviceDate', value)}
                    onDueDateChange={(value) => setField('dueDate', value)}
                />
            </div>
            <div className="mt-8 space-y-6">
                <Field>
                    <FieldLabel htmlFor="credit-note-introductory-text">
                        Introductory text
                    </FieldLabel>
                    <Textarea
                        id="credit-note-introductory-text"
                        value={draft.introductoryText}
                        onChange={(event) => setField(
                            'introductoryText',
                            event.target.value,
                        )}
                    />
                </Field>
                <Products
                    items={draft.items}
                    isLoading={loader.isLoading}
                    onItemsChange={draftState.setItems}
                    documentName="credit note"
                    showOriginalInvoice
                />
                <Field>
                    <FieldLabel htmlFor="credit-note-closing-text">Closing text</FieldLabel>
                    <Textarea
                        id="credit-note-closing-text"
                        value={draft.closingText}
                        onChange={(event) => setField('closingText', event.target.value)}
                    />
                </Field>
                <PriceQuoteSummary total={draftState.totalIncludingVat} />
            </div>
        </div>
    )
}
