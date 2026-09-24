import EmailDocumentDialog from '@/components/EmailDocumentDialog'
import { ComponentMode } from '@/lib/component-mode'
import type { Invoice } from '@/lib/invoice-types'
import { useInvoiceSearchPrint } from './hooks/useInvoiceSearchPrint'
import { useInvoiceRemindersEmail } from './hooks/useInvoiceRemindersEmail'
import { useInvoiceSearchResults } from './hooks/useInvoiceSearchResults'
import { useInvoiceSearchSelection } from './hooks/useInvoiceSearchSelection'
import { useInvoiceSearchState } from './hooks/useInvoiceSearchState'
import InvoiceSearchErrors from './InvoiceSearchErrors'
import InvoiceSearchForm from './InvoiceSearchForm'
import InvoiceSearchMenu from './InvoiceSearchMenu'
import InvoiceSearchResults from './InvoiceSearchResults'
import InvoiceSearchResultsByCustomer from './InvoiceSearchResultsByCustomer'
import InvoiceSearchSummary from './InvoiceSearchSummary'
import type { PaymentStatus } from './types'

type InvoiceSearchProps = {
    mode: ComponentMode
    onInvoiceSelect?: (invoice: Invoice) => void
    defaultPaymentStatus?: PaymentStatus
    defaultProductCode?: string
    showSearchFields?: boolean
    showSummary?: boolean
}

function InvoiceSearch({
    mode,
    onInvoiceSelect,
    defaultPaymentStatus,
    defaultProductCode,
    showSearchFields = true,
    showSummary = true,
}: InvoiceSearchProps) {
    const searchState = useInvoiceSearchState(mode, defaultPaymentStatus, defaultProductCode)
    const { search, searchKey } = searchState
    const { invoicePage, customerSummaryPage, invoices, isLoading, error } = useInvoiceSearchResults(
        search,
        searchKey,
    )
    const { selectedInvoiceNumber, selectInvoice, clearSelection } =
        useInvoiceSearchSelection(onInvoiceSelect)
    const { canPrint, canPrintReminders, printReport, printReminders, printError } =
        useInvoiceSearchPrint({
            search,
            hasResults: invoices.length > 0,
            isLoading,
            hasError: Boolean(error),
            customerSummaryCount: customerSummaryPage?.customerSummaries.length ?? 0,
            keyboardShortcutEnabled: mode === ComponentMode.Page,
        })
    const remindersEmail = useInvoiceRemindersEmail(search, customerSummaryPage)

    function clearSearchAndSelection() {
        clearSelection()
        searchState.clearSearch()
    }

    return (
        <div className="p-4">
            <InvoiceSearchErrors printError={printError} searchError={error} />
            {mode === ComponentMode.Page && (
                <InvoiceSearchMenu
                    reportDisabled={!canPrint}
                    remindersDisabled={!canPrintReminders}
                    onPrintReport={printReport}
                    onPrintReminders={printReminders}
                    onEmailReminders={remindersEmail.openDialog}
                />
            )}
            <EmailDocumentDialog
                open={remindersEmail.dialogOpen}
                documentName="reminders"
                customerId={remindersEmail.customerId}
                customerName={remindersEmail.customerName}
                businessYear={remindersEmail.businessYear}
                defaultSubject="Drevi d.o.o. - Opomin"
                defaultMessage={'Pozdravljeni,\n\nv priponki vam pošiljamo opomin za zapadle neporavnane račune.\n\nLep pozdrav, Drevi d.o.o. 041 693 605'}
                onSend={remindersEmail.sendReminders}
                onOpenChange={remindersEmail.setDialogOpen}
            />
            {showSearchFields && (
                <InvoiceSearchForm
                    key={searchKey}
                    search={search}
                    showResultsView={mode === ComponentMode.Page}
                    onSubmit={searchState.updateSearch}
                    onReset={clearSearchAndSelection}
                />
            )}
            {!error && search.resultsView === 'invoiceList' && (
                <InvoiceSearchResults
                    invoicePage={invoicePage}
                    invoices={invoices}
                    isLoading={isLoading}
                    mode={mode}
                    search={search}
                    showSearchFields={showSearchFields}
                    selectedInvoiceNumber={selectedInvoiceNumber}
                    onInvoiceSelect={selectInvoice}
                    onPageChange={(page) => searchState.changePage(page, invoicePage?.pageSize)}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
            {!error && search.resultsView === 'customer' && (
                <InvoiceSearchResultsByCustomer
                    summaryPage={customerSummaryPage}
                    isLoading={isLoading}
                    mode={mode}
                    selectedInvoiceNumber={selectedInvoiceNumber}
                    onInvoiceSelect={selectInvoice}
                    onPageChange={(page) => searchState.changePage(
                        page,
                        customerSummaryPage?.pageSize,
                    )}
                    onPageSizeChange={searchState.changePageSize}
                />
            )}
            {!error && showSummary && <InvoiceSearchSummary invoices={invoices} />}
        </div>
    )
}

export default InvoiceSearch
