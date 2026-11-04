import { ComponentMode } from '@/lib/component-mode'
import type { CreditNote } from '@/pages/credit-note/types'
import CreditNoteSearchErrors from './CreditNoteSearchErrors'
import CreditNoteSearchForm from './CreditNoteSearchForm'
import CreditNoteSearchResults from './CreditNoteSearchResults'
import { useCreditNoteSearchResults } from './hooks/useCreditNoteSearchResults'
import { useCreditNoteSearchState } from './hooks/useCreditNoteSearchState'

type Props = {
    mode: ComponentMode
    onCreditNoteSelect?: (creditNote: CreditNote) => void
}

export default function CreditNoteSearch({ mode, onCreditNoteSelect }: Props) {
    const searchState = useCreditNoteSearchState(mode)
    const { search, searchKey } = searchState
    const { creditNotePage, isLoading, error } = useCreditNoteSearchResults(
        search,
        searchKey,
    )
    return (
        <div className="p-4">
            <CreditNoteSearchErrors error={error} />
            <CreditNoteSearchForm
                key={searchKey}
                search={search}
                onSubmit={searchState.updateSearch}
                onReset={searchState.clearSearch}
            />
            {!error && (
                <CreditNoteSearchResults
                    creditNotePage={creditNotePage}
                    isLoading={isLoading}
                    mode={mode}
                    search={search}
                    onCreditNoteSelect={onCreditNoteSelect}
                    onPageChange={(page) => searchState.changePage(
                        page,
                        creditNotePage?.pageSize,
                    )}
                    onPageSizeChange={searchState.changePageSize}
                    onSort={searchState.changeSort}
                />
            )}
        </div>
    )
}
