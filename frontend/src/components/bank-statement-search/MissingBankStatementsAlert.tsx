import { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { MissingBankStatementDate } from '@/lib/bank-statement-types'
import { formatDate } from '@/lib/formatters'

type MissingBankStatementsAlertProps = {
    missingDates: MissingBankStatementDate[]
}

const hiddenDatesStorageKey = 'hiddenMissingBankStatementDates'

function getHiddenDates(): Set<string> {
    try {
        const storedDates: unknown = JSON.parse(localStorage.getItem(hiddenDatesStorageKey) ?? '[]')
        return new Set(Array.isArray(storedDates)
            ? storedDates.filter((date): date is string => typeof date === 'string')
            : [])
    } catch {
        return new Set()
    }
}

function MissingBankStatementsAlert({ missingDates }: MissingBankStatementsAlertProps) {
    const [dismissed, setDismissed] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [showHiddenDates, setShowHiddenDates] = useState(false)
    const [hiddenDates, setHiddenDates] = useState(getHiddenDates)
    const visibleDates = missingDates.filter((missingDate) => !hiddenDates.has(missingDate.date))
    const hiddenDateCount = missingDates.length - visibleDates.length
    const displayedDates = showHiddenDates ? missingDates : visibleDates

    const toggleDateVisibility = (date: string) => {
        const nextHiddenDates = new Set(hiddenDates)
        if (nextHiddenDates.has(date)) {
            nextHiddenDates.delete(date)
        } else {
            nextHiddenDates.add(date)
        }
        setHiddenDates(nextHiddenDates)

        try {
            localStorage.setItem(hiddenDatesStorageKey, JSON.stringify([...nextHiddenDates]))
        } catch {
            // The date still stays hidden until the page is refreshed when storage is unavailable.
        }
    }

    if (dismissed || missingDates.length === 0) return null

    return (
        <Alert
            variant="warning"
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            className="mb-6 max-w-4xl cursor-pointer"
            onClick={() => setExpanded((current) => !current)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setExpanded((current) => !current)
                }
            }}
        >
            <TriangleAlert />
            <AlertTitle className="flex flex-wrap items-center gap-x-3">
                <span>
                    {visibleDates.length === 0
                        ? 'There are missing bank statements, but all dates are hidden'
                        : `${visibleDates.length} missing bank ${visibleDates.length === 1 ? 'statement' : 'statements'}`}
                </span>
                {hiddenDateCount > 0 && (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        aria-pressed={showHiddenDates}
                        onClick={(event) => {
                            event.stopPropagation()
                            const nextShowHiddenDates = !showHiddenDates
                            setShowHiddenDates(nextShowHiddenDates)
                            if (nextShowHiddenDates) setExpanded(true)
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                    >
                        {showHiddenDates
                            ? `Show only visible dates (${hiddenDateCount} hidden)`
                            : `Show all dates (${hiddenDateCount} hidden)`}
                    </Button>
                )}
            </AlertTitle>
            {expanded && <AlertDescription>
                <p>
                    The reconciliation check found no bank statement for the following dates.
                    Weekend dates are included for completeness and marked as non-business days.
                </p>
                <ul className="mt-3 grid max-h-64 gap-1 overflow-y-auto">
                    {displayedDates.map((missingDate) => (
                        <li key={missingDate.date}>
                            <button
                                type="button"
                                className={`w-full cursor-pointer rounded-sm text-left hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${hiddenDates.has(missingDate.date) ? 'opacity-60 line-through' : ''}`}
                                aria-label={`${hiddenDates.has(missingDate.date) ? 'Restore' : 'Hide'} ${formatDate(missingDate.date)}`}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    toggleDateVisibility(missingDate.date)
                                }}
                                onKeyDown={(event) => event.stopPropagation()}
                            >
                                {formatDate(missingDate.date)}
                                {missingDate.isWeekend && (
                                    <span className="ml-1 font-medium">
                                        — Non-business day (weekend)
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </AlertDescription>}
            <AlertAction>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Dismiss missing bank statements warning"
                    onClick={(event) => {
                        event.stopPropagation()
                        setDismissed(true)
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                >
                    <X />
                </Button>
            </AlertAction>
        </Alert>
    )
}

export default MissingBankStatementsAlert
