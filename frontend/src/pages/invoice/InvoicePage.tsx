import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import EmailDocumentDialog from '@/components/EmailDocumentDialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { dateAfterDays } from '@/lib/dates'
import { sendDocumentEmail } from '@/lib/document-email'
import { toast } from '@/lib/toast'
import CustomerInputFields from './CustomerInputFields'
import GeneralInformationInput from './GeneralInformationInput'
import InvoiceNumberAlert from './InvoiceNumberAlert'
import InvoiceMenu from './InvoiceMenu'
import InvoiceSummary from './InvoiceSummary'
import Products from './Products'
import UnsavedInvoiceAlerts from './UnsavedInvoiceAlerts'
import { useInvoiceDraft } from './hooks/useInvoiceDraft'
import { useInvoiceDuplicate } from './hooks/useInvoiceDuplicate'
import { useInvoiceHalcomExport } from './hooks/useInvoiceHalcomExport'
import { useInvoiceKeyboardShortcuts } from './hooks/useInvoiceKeyboardShortcuts'
import { useInvoiceLoader } from './hooks/useInvoiceLoader'
import { useInvoiceNumberNavigation } from './hooks/useInvoiceNumberNavigation'
import { useInvoicePrint } from './hooks/useInvoicePrint'
import { useInvoiceRevert } from './hooks/useInvoiceRevert'
import { useInvoiceSave } from './hooks/useInvoiceSave'
import { useInvoiceXmlExport } from './hooks/useInvoiceXmlExport'
import { useUnsavedInvoiceGuard } from './hooks/useUnsavedInvoiceGuard'

function InvoicePage() {
    const { invoiceNumber: routeInvoiceNumber } = useParams()
    const navigate = useNavigate()
    const draftState = useInvoiceDraft()
    const { draft, setDraft, setField } = draftState
    const guard = useUnsavedInvoiceGuard(draftState.hasUnsavedChanges)
    const loader = useInvoiceLoader({
        routeInvoiceNumber, replaceDraft: setDraft, markClean: draftState.markClean,
        clearCleanDraft: draftState.clearCleanDraft, disallowNavigation: guard.disallowNavigation,
    })
    const navigation = useInvoiceNumberNavigation(routeInvoiceNumber, navigate)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const [confirmingEmail, setConfirmingEmail] = useState(false)

    const save = useInvoiceSave({
        invoiceId: loader.invoiceId, draft, routeInvoiceNumber,
        isLoading: loader.isLoading, loadError: loader.error, navigate,
        markClean: draftState.markClean, allowNavigation: guard.allowNavigation,
        reloadAfterSave: loader.reloadAfterSave,
    })
    const duplicate = useInvoiceDuplicate({
        invoiceId: loader.invoiceId, businessYear: loader.businessYear, draft,
        hasUnsavedChanges: draftState.hasUnsavedChanges, navigate, replaceDraft: setDraft,
        markUnsaved: draftState.markUnsaved, setInvoiceId: loader.setInvoiceId,
        setBusinessYear: loader.setBusinessYear, setRequestErrors: loader.setRequestErrors,
        preserveDuplicateDraft: loader.preserveDuplicateDraft, allowNavigation: guard.allowNavigation,
    })
    const print = useInvoicePrint({
        invoiceId: loader.invoiceId, invoiceNumber: draft.invoiceNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading, loadError: loader.error,
        isSaving: save.isSaving, isDuplicating: duplicate.isDuplicating,
        canSave: save.canSave,
    })
    const xmlExport = useInvoiceXmlExport({
        invoiceNumber: draft.invoiceNumber,
        canExport: print.canPrint, canSave: save.canSave,
    })
    const halcomExport = useInvoiceHalcomExport({
        invoiceNumber: draft.invoiceNumber,
        canExport: print.canPrint, canSave: save.canSave,
    })
    const revert = useInvoiceRevert({
        routeInvoiceNumber, hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading, isSaving: save.isSaving,
        isDuplicating: duplicate.isDuplicating,
        clearSaveError: () => save.setSaveError(null),
        clearPrintError: () => print.setPrintError(null), reload: loader.reload,
    })
    useInvoiceKeyboardShortcuts(() => { void save.requestSave() }, print.printInvoice)
    const email = () => {
        if (print.canPrint) setEmailDialogOpen(true)
        else if (save.canSave) setConfirmingEmail(true)
    }
    const errors = [
        ['invoice', 'Invoice could not be loaded', 'The invoice data could not be retrieved.', loader.error],
        ['print', 'Invoice could not be printed', 'The invoice PDF could not be prepared.', print.printError],
        ['xml', 'Invoice XML could not be exported', 'The invoice XML could not be prepared.', xmlExport.exportError],
        ['halcom', 'Halcom package could not be exported', 'The invoice package could not be prepared.', halcomExport.exportError],
        ['save', 'Invoice could not be saved', 'Your changes were not saved.', save.saveError],
        ['latest', 'Latest invoice number could not be loaded', 'Invoice navigation may be unavailable.', navigation.latestInvoiceNumberError],
        ['next', 'Next invoice number could not be loaded', 'A number could not be assigned to the new invoice.', loader.requestErrors.nextInvoiceNumber],
        ['template', 'Invoice text template could not be loaded', 'The new invoice was opened without its default text.', loader.requestErrors.invoiceTextTemplate],
        ['year', 'Business year could not be loaded', 'The invoice business-year details are unavailable.', loader.requestErrors.businessYear],
        ['current-year', 'Current business year could not be loaded', 'The invoice could not be duplicated.', loader.requestErrors.currentBusinessYear],
        ['duplicate-number', 'Duplicate invoice number could not be loaded', 'A number could not be assigned to the duplicate.', loader.requestErrors.duplicateInvoiceNumber],
        ['payment-term', 'Customer payment term could not be loaded', 'The duplicate invoice due date could not be calculated.', loader.requestErrors.customerPaymentTerm],
    ] as const

    return <div className="max-w-5xl p-4">
        {errors.some(([, , , error]) => error) && <div className="mb-6 space-y-2">
            {errors.map(([key, title, description, error]) => error &&
                <ErrorAlert key={key} title={title} description={description} error={error} />)}
        </div>}
        <div className="mb-6 flex items-center gap-2">
            <InvoiceMenu canSave={save.canSave} canPrint={print.canRequestPrint} canEmail={print.canRequestPrint}
                canExportXml={print.canRequestPrint} isExportingXml={xmlExport.isExporting}
                isExportingHalcom={halcomExport.isExporting}
                canRevert={revert.canRevert}
                canDuplicate={loader.invoiceId != null && !loader.isLoading && !save.isSaving}
                isSaving={save.isSaving} isDuplicating={duplicate.isDuplicating}
                onSave={() => { void save.requestSave() }} onPrint={print.printInvoice}
                onEmail={email} onRevert={revert.requestRevert}
                onExportXml={() => { void xmlExport.exportXml() }}
                onExportHalcom={() => { void halcomExport.exportHalcom() }}
                onDuplicate={() => { void duplicate.duplicate() }} />
            <Button type="button" variant="outline" size="icon" aria-label="Previous invoice"
                disabled={!navigation.canNavigatePrevious} onClick={navigation.navigatePrevious}><ChevronLeft /></Button>
            <Button type="button" variant="outline" size="icon" aria-label="Next invoice"
                disabled={!navigation.canNavigateNext} onClick={navigation.navigateNext}><ChevronRight /></Button>
        </div>
        <EmailDocumentDialog open={emailDialogOpen} documentName="invoice"
            customerId={draft.customerId} customerName={draft.customerName}
            businessYear={loader.businessYear}
            defaultSubject={`Drevi d.o.o. - Račun ${loader.businessYear
                ? `${draft.invoiceNumber.trim()}/${loader.businessYear}` : draft.invoiceNumber.trim()}`}
            defaultMessage={`Pozdravljeni,\n\nv priponki vam pošiljamo račun ${loader.businessYear
                ? `${draft.invoiceNumber.trim()}/${loader.businessYear}` : draft.invoiceNumber.trim()}.\n\nLep pozdrav, Drevi d.o.o. 041 693 605`}
            onSend={async (fields) => {
                await sendDocumentEmail('invoices', draft.invoiceNumber.trim(), fields)
                toast.add({ title: 'Invoice emailed',
                    description: `Invoice ${draft.invoiceNumber.trim()} was sent to ${fields.recipient}.`,
                    type: 'success' })
            }}
            onOpenChange={setEmailDialogOpen} />
        <InvoiceNumberAlert invoiceNumber={draft.invoiceNumber.trim()} warning={save.invoiceNumberWarning}
            onOpenChange={(open) => { if (!open) save.setInvoiceNumberWarning(null) }}
            onConfirm={() => { void save.confirmSave() }} />
        <UnsavedInvoiceAlerts isNavigationBlocked={guard.blocker.state === 'blocked'}
            isConfirmingRevert={revert.confirmingRevert} isConfirmingDuplicate={duplicate.confirmingDuplicate}
            isConfirmingPrint={print.confirmingPrint}
            isConfirmingEmail={confirmingEmail}
            isConfirmingXmlExport={xmlExport.confirmingExport}
            isConfirmingHalcomExport={halcomExport.confirmingExport}
            onCancelNavigation={() => { if (guard.blocker.state === 'blocked') guard.blocker.reset() }}
            onDiscardAndNavigate={guard.discardAndNavigate}
            onConfirmingRevertChange={revert.setConfirmingRevert} onDiscardAndRevert={revert.performRevert}
            onConfirmingDuplicateChange={duplicate.setConfirmingDuplicate}
            onDuplicateAnyway={() => { void duplicate.performDuplicate() }}
            onConfirmingPrintChange={print.setConfirmingPrint}
            onSaveBeforePrint={() => { print.setConfirmingPrint(false); void save.requestSave() }}
            onConfirmingEmailChange={setConfirmingEmail}
            onSaveBeforeEmail={() => { setConfirmingEmail(false); void save.requestSave() }}
            onConfirmingXmlExportChange={xmlExport.setConfirmingExport}
            onSaveBeforeXmlExport={() => {
                xmlExport.setConfirmingExport(false); void save.requestSave()
            }}
            onConfirmingHalcomExportChange={halcomExport.setConfirmingExport}
            onSaveBeforeHalcomExport={() => {
                halcomExport.setConfirmingExport(false); void save.requestSave()
            }} />
        <div className="grid items-start gap-6 lg:grid-cols-2">
            <CustomerInputFields customerId={draft.customerId} customerName={draft.customerName}
                customerAddress={draft.customerAddress} customerPostalCode={draft.customerPostalCode}
                customerCity={draft.customerCity} customerCountry={draft.customerCountry}
                onCustomerIdChange={(v) => setField('customerId', v)}
                onCustomerNameChange={(v) => setField('customerName', v)}
                onCustomerAddressChange={(v) => setField('customerAddress', v)}
                onCustomerPostalCodeChange={(v) => setField('customerPostalCode', v)}
                onCustomerCityChange={(v) => setField('customerCity', v)}
                onCustomerCountryChange={(v) => setField('customerCountry', v)}
                onCustomerPaymentTermChange={(term) => setField('dueDate', dateAfterDays(draft.invoiceDate, term))} />
            <GeneralInformationInput invoiceNumber={draft.invoiceNumber} businessYear={loader.businessYear}
                invoiceDate={draft.invoiceDate} dueDate={draft.dueDate} serviceDate={draft.serviceDate}
                purchaseOrderNumber={draft.purchaseOrderNumber}
                onInvoiceNumberChange={(v) => setField('invoiceNumber', v)}
                onInvoiceDateChange={(v) => setField('invoiceDate', v)}
                onDueDateChange={(v) => setField('dueDate', v)}
                onServiceDateChange={(v) => setField('serviceDate', v)}
                onPurchaseOrderNumberChange={(v) => setField('purchaseOrderNumber', v)} />
        </div>
        <div className="mt-8 space-y-6">
            <Field className="lg:w-[calc(50%-0.75rem)]">
                <FieldLabel htmlFor="delivery-note-number">Delivery note number</FieldLabel>
                <Input id="delivery-note-number" name="deliveryNoteNumber"
                    value={draft.deliveryNoteNumber}
                    onChange={(event) => setField('deliveryNoteNumber', event.target.value)} />
            </Field>
            <Field><FieldLabel htmlFor="introductory-text">Introductory text</FieldLabel>
                <Textarea id="introductory-text" name="introductoryText" value={draft.introductoryText}
                    onChange={(e) => setField('introductoryText', e.target.value)} /></Field>
            <Products items={draft.invoiceItems} isLoading={loader.isLoading} onItemsChange={draftState.setItems} />
            <Field><FieldLabel htmlFor="closing-text">Closing text</FieldLabel>
                <Textarea id="closing-text" name="closingText" value={draft.closingText}
                    onChange={(e) => setField('closingText', e.target.value)} /></Field>
            <InvoiceSummary total={draftState.totalIncludingVat} paidAmount={draft.paidAmount}
                paymentDate={draft.paymentDate} />
        </div>
    </div>
}

export default InvoicePage
