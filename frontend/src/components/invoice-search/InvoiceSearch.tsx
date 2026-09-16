import { useState } from 'react'
import InvoiceSearchMenu from '@/pages/invoice/InvoiceSearchMenu'
import { ComponentMode } from '@/lib/component-mode'
import type { Invoice } from '@/lib/invoice-types'
import { useInvoiceSearchPrint } from './hooks/useInvoiceSearchPrint'
import { useInvoiceSearchResults } from './hooks/useInvoiceSearchResults'
import { useInvoiceSearchState } from './hooks/useInvoiceSearchState'
import InvoiceSearchErrors from './InvoiceSearchErrors'
import InvoiceSearchForm from './InvoiceSearchForm'
import InvoiceSearchResults from './InvoiceSearchResults'
import InvoiceSearchSummary from './InvoiceSearchSummary'

type InvoiceSearchProps = {
    mode: ComponentMode
    onInvoiceSelect?: (invoice: Invoice) => void
}

function InvoiceSearch({ mode, onInvoiceSelect }: InvoiceSearchProps) {
    const searchState = useInvoiceSearchState(mode)
    const { search, searchKey } = searchState
    const { invoicePage, invoices, isLoading, error } = useInvoiceSearchResults(
        search,
        searchKey,
    )
    const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)
    const canPrint = !isLoading && !error && invoices.length > 0
    const { printReport, printError } = useInvoiceSearchPrint({
        search,
        canPrint,
        keyboardShortcutEnabled: mode === ComponentMode.Page,
    })

    function clearSearchAndSelection() {
        setSelectedInvoiceNumber(null)
        searchState.clearSearch()
    }

    function selectInvoice(invoice: Invoice) {
        setSelectedInvoiceNumber(invoice.invoiceNumber)
        onInvoiceSelect?.(invoice)
    }

    return (
        <div className="p-4">
            <InvoiceSearchErrors printError={printError} searchError={error} />
            {mode === ComponentMode.Page && (
                <InvoiceSearchMenu disabled={!canPrint} onPrint={printReport} />
            )}
            <InvoiceSearchForm
                key={searchKey}
                search={search}
                onSubmit={searchState.updateSearch}
                onReset={clearSearchAndSelection}
            />
            {!error && (
                <InvoiceSearchResults
                    invoicePage={invoicePage}
                    invoices={invoices}
                    isLoading={isLoading}
                    mode={mode}
                    search={search}
                    selectedInvoiceNumber={selectedInvoiceNumber}
                    onInvoiceSelect={selectInvoice}
                    onPageChange={(page) => searchState.changePage(page, invoicePage?.pageSize)}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
            {!error && <InvoiceSearchSummary invoices={invoices} />}
        </div>
    )
}

export default InvoiceSearch
