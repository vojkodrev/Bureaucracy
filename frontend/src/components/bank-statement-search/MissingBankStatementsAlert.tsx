import { useState } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { MissingBankStatementDate } from '@/lib/bank-statement-types'
import { formatDate } from '@/lib/formatters'

type MissingBankStatementsAlertProps = {
    missingDates: MissingBankStatementDate[]
}

function MissingBankStatementsAlert({ missingDates }: MissingBankStatementsAlertProps) {
    const [dismissed, setDismissed] = useState(false)
    const [expanded, setExpanded] = useState(false)

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
            <AlertTitle>
                {missingDates.length} missing bank {missingDates.length === 1 ? 'statement' : 'statements'}
            </AlertTitle>
            {expanded && <AlertDescription>
                <p>
                    The reconciliation check found no bank statement for the following dates.
                    Weekend dates are included for completeness and marked as non-business days.
                </p>
                <ul className="mt-3 grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
                    {missingDates.map((missingDate) => (
                        <li key={missingDate.date}>
                            {formatDate(missingDate.date)}
                            {missingDate.isWeekend && (
                                <span className="ml-1 font-medium">
                                    — Non-business day (weekend)
                                </span>
                            )}
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
