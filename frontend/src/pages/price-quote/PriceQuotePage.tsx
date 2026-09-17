import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorAlert from '@/components/ErrorAlert'
import EmailDocumentDialog from '@/components/EmailDocumentDialog'
import SaveCustomerEmailAlert from '@/components/SaveCustomerEmailAlert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { dateAfterDays } from '@/lib/dates'
import { sendDocumentEmail } from '@/lib/document-email'
import { toast } from '@/lib/toast'
import CustomerInputFields from '../invoice/CustomerInputFields'
import Products from '../invoice/Products'
import PriceQuoteGeneralInformation from './PriceQuoteGeneralInformation'
import PriceQuoteMenu from './PriceQuoteMenu'
import PriceQuoteNumberAlert from './PriceQuoteNumberAlert'
import PriceQuoteSummary from './PriceQuoteSummary'
import UnsavedPriceQuoteAlerts from './UnsavedPriceQuoteAlerts'
import { usePriceQuoteDraft } from './hooks/usePriceQuoteDraft'
import { usePriceQuoteDuplicate } from './hooks/usePriceQuoteDuplicate'
import { usePriceQuoteKeyboardShortcuts } from './hooks/usePriceQuoteKeyboardShortcuts'
import { usePriceQuoteLoader } from './hooks/usePriceQuoteLoader'
import { usePriceQuoteNumberNavigation } from './hooks/usePriceQuoteNumberNavigation'
import { usePriceQuotePrint } from './hooks/usePriceQuotePrint'
import { usePriceQuoteRevert } from './hooks/usePriceQuoteRevert'
import { usePriceQuoteSave } from './hooks/usePriceQuoteSave'
import { useUnsavedPriceQuoteGuard } from './hooks/useUnsavedPriceQuoteGuard'

export default function PriceQuotePage() {
    const { quoteNumber: routeQuoteNumber } = useParams()
    const navigate = useNavigate()
    const draftState = usePriceQuoteDraft()
    const { draft, setDraft, setField } = draftState
    const guard = useUnsavedPriceQuoteGuard(draftState.hasUnsavedChanges)
    const loader = usePriceQuoteLoader({
        routeQuoteNumber, replaceDraft: setDraft, markClean: draftState.markClean,
        clearCleanDraft: draftState.clearCleanDraft,
        disallowNavigation: guard.disallowNavigation,
    })
    const navigation = usePriceQuoteNumberNavigation(routeQuoteNumber, navigate)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const [confirmingEmail, setConfirmingEmail] = useState(false)
    const [customerEmailToSave, setCustomerEmailToSave] = useState<string | null>(null)
    const save = usePriceQuoteSave({
        priceQuoteId: loader.priceQuoteId, draft, routeQuoteNumber,
        isLoading: loader.isLoading, loadError: loader.error, navigate,
        markClean: draftState.markClean, allowNavigation: guard.allowNavigation,
        reloadAfterSave: loader.reloadAfterSave,
    })
    const duplicate = usePriceQuoteDuplicate({
        priceQuoteId: loader.priceQuoteId, businessYear: loader.businessYear, draft,
        hasUnsavedChanges: draftState.hasUnsavedChanges, navigate, replaceDraft: setDraft,
        markUnsaved: draftState.markUnsaved, setPriceQuoteId: loader.setPriceQuoteId,
        setBusinessYear: loader.setBusinessYear, setRequestErrors: loader.setRequestErrors,
        preserveDuplicateDraft: loader.preserveDuplicateDraft,
        allowNavigation: guard.allowNavigation,
    })
    const print = usePriceQuotePrint({
        priceQuoteId: loader.priceQuoteId, quoteNumber: draft.quoteNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading, loadError: loader.error,
        isSaving: save.isSaving, isDuplicating: duplicate.isDuplicating,
        canSave: save.canSave,
    })
    const revert = usePriceQuoteRevert({
        routeQuoteNumber, hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading, isSaving: save.isSaving,
        isDuplicating: duplicate.isDuplicating,
        clearSaveError: () => save.setSaveError(null),
        clearPrintError: () => print.setPrintError(null), reload: loader.reload,
    })
    usePriceQuoteKeyboardShortcuts(() => { void save.requestSave() }, print.printPriceQuote)
    const email = () => {
        if (print.canPrint) setEmailDialogOpen(true)
        else if (save.canSave) setConfirmingEmail(true)
    }
    const errors = [
        ['price-quote', 'Price quote could not be loaded', 'The price quote data could not be retrieved.', loader.error],
        ['print', 'Price quote could not be printed', 'The price quote PDF could not be prepared.', print.printError],
        ['save', 'Price quote could not be saved', 'Your changes were not saved.', save.saveError],
        ['latest', 'Latest price quote number could not be loaded', 'Price quote navigation may be unavailable.', navigation.latestPriceQuoteNumberError],
        ['next', 'Next price quote number could not be loaded', 'A number could not be assigned to the new price quote.', loader.requestErrors.nextPriceQuoteNumber],
        ['template', 'Price quote text template could not be loaded', 'The new price quote was opened without its default text.', loader.requestErrors.priceQuoteTextTemplate],
        ['year', 'Business year could not be loaded', 'The price quote business-year details are unavailable.', loader.requestErrors.businessYear],
        ['current-year', 'Current business year could not be loaded', 'The price quote could not be duplicated.', loader.requestErrors.currentBusinessYear],
        ['duplicate-number', 'Duplicate price quote number could not be loaded', 'A number could not be assigned to the duplicate.', loader.requestErrors.duplicatePriceQuoteNumber],
        ['payment-term', 'Customer payment term could not be loaded', 'The duplicate price quote validity date could not be calculated.', loader.requestErrors.customerPaymentTerm],
    ] as const

    return <div className="max-w-5xl p-4">
        {errors.some(([, , , error]) => error) && <div className="mb-6 space-y-2">
            {errors.map(([key, title, description, error]) => error &&
                <ErrorAlert key={key} title={title} description={description} error={error} />)}
        </div>}
        <div className="mb-6 flex items-center gap-2">
            <PriceQuoteMenu canSave={save.canSave} canPrint={print.canRequestPrint}
                canEmail={print.canRequestPrint}
                canRevert={revert.canRevert}
                canDuplicate={loader.priceQuoteId != null && !loader.isLoading && !save.isSaving}
                isSaving={save.isSaving} isDuplicating={duplicate.isDuplicating}
                onSave={() => { void save.requestSave() }} onPrint={print.printPriceQuote}
                onEmail={email}
                onRevert={revert.requestRevert} onDuplicate={() => { void duplicate.duplicate() }} />
            <Button type="button" variant="outline" size="icon" aria-label="Previous price quote"
                disabled={!navigation.canNavigatePrevious} onClick={navigation.navigatePrevious}>
                <ChevronLeft />
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Next price quote"
                disabled={!navigation.canNavigateNext} onClick={navigation.navigateNext}>
                <ChevronRight />
            </Button>
        </div>
        <EmailDocumentDialog open={emailDialogOpen} documentName="price quote"
            customerId={draft.customerId} businessYear={loader.businessYear}
            defaultSubject={`Drevi d.o.o. - Predračun ${loader.businessYear
                ? `${draft.quoteNumber.trim()}/${loader.businessYear}` : draft.quoteNumber.trim()}`}
            defaultMessage={`Pozdravljeni,\n\nv priponki vam pošiljamo predračun ${loader.businessYear
                ? `${draft.quoteNumber.trim()}/${loader.businessYear}` : draft.quoteNumber.trim()}.\n\nLep pozdrav, Drevi d.o.o. 041 693 605`}
            onSend={async (fields) => {
                await sendDocumentEmail('price-quotes', draft.quoteNumber.trim(), fields)
                toast.add({ title: 'Price quote emailed',
                    description: `Price quote ${draft.quoteNumber.trim()} was sent to ${fields.recipient}.`,
                    type: 'success' })
            }}
            onOpenChange={setEmailDialogOpen} onOfferSaveCustomerEmail={setCustomerEmailToSave} />
        <SaveCustomerEmailAlert email={customerEmailToSave} customerId={draft.customerId}
            customerName={draft.customerName}
            onOpenChange={(open) => { if (!open) setCustomerEmailToSave(null) }} />
        <PriceQuoteNumberAlert quoteNumber={draft.quoteNumber.trim()} warning={save.numberWarning}
            onOpenChange={(open) => { if (!open) save.setNumberWarning(null) }}
            onConfirm={() => { void save.confirmSave() }} />
        <UnsavedPriceQuoteAlerts isNavigationBlocked={guard.blocker.state === 'blocked'}
            isConfirmingRevert={revert.confirmingRevert} isConfirmingDuplicate={duplicate.confirmingDuplicate}
            isConfirmingPrint={print.confirmingPrint}
            isConfirmingEmail={confirmingEmail}
            onCancelNavigation={() => { if (guard.blocker.state === 'blocked') guard.blocker.reset() }}
            onDiscardAndNavigate={guard.discardAndNavigate}
            onConfirmingRevertChange={revert.setConfirmingRevert} onDiscardAndRevert={revert.performRevert}
            onConfirmingDuplicateChange={duplicate.setConfirmingDuplicate}
            onDuplicateAnyway={() => { void duplicate.performDuplicate() }}
            onConfirmingPrintChange={print.setConfirmingPrint}
            onSaveBeforePrint={() => { print.setConfirmingPrint(false); void save.requestSave() }}
            onConfirmingEmailChange={setConfirmingEmail}
            onSaveBeforeEmail={() => { setConfirmingEmail(false); void save.requestSave() }} />
        <div className="grid items-start gap-6 lg:grid-cols-2">
            <CustomerInputFields customerId={draft.customerId} customerName={draft.customerName}
                customerAddress={draft.customerAddress} customerPostalCode={draft.customerPostalCode}
                customerCity={draft.customerCity} customerCountry={draft.customerCountry}
                onCustomerIdChange={(value) => setField('customerId', value)}
                onCustomerNameChange={(value) => setField('customerName', value)}
                onCustomerAddressChange={(value) => setField('customerAddress', value)}
                onCustomerPostalCodeChange={(value) => setField('customerPostalCode', value)}
                onCustomerCityChange={(value) => setField('customerCity', value)}
                onCustomerCountryChange={(value) => setField('customerCountry', value)}
                onCustomerPaymentTermChange={(term) =>
                    setField('dueDate', dateAfterDays(draft.issueDate, term))} />
            <PriceQuoteGeneralInformation quoteNumber={draft.quoteNumber}
                businessYear={loader.businessYear} issueDate={draft.issueDate} dueDate={draft.dueDate}
                onQuoteNumberChange={(value) => setField('quoteNumber', value)}
                onIssueDateChange={(value) => setField('issueDate', value)}
                onDueDateChange={(value) => setField('dueDate', value)} />
        </div>
        <div className="mt-8 space-y-6">
            <Field><FieldLabel htmlFor="price-quote-introductory-text">Introductory text</FieldLabel>
                <Textarea id="price-quote-introductory-text" name="introductoryText"
                    value={draft.introductoryText}
                    onChange={(event) => setField('introductoryText', event.target.value)} /></Field>
            <Products items={draft.items} isLoading={loader.isLoading}
                onItemsChange={draftState.setItems} documentName="price quote" />
            <Field><FieldLabel htmlFor="price-quote-closing-text">Closing text</FieldLabel>
                <Textarea id="price-quote-closing-text" name="closingText" value={draft.closingText}
                    onChange={(event) => setField('closingText', event.target.value)} /></Field>
            <PriceQuoteSummary total={draftState.totalIncludingVat} />
        </div>
    </div>
}
