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

    if (dismissed || missingDates.length === 0) return null

    return (
        <Alert variant="warning" className="mb-6 max-w-4xl">
            <TriangleAlert />
            <AlertTitle>
                {missingDates.length} missing bank {missingDates.length === 1 ? 'statement' : 'statements'}
            </AlertTitle>
            <AlertDescription>
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
            </AlertDescription>
            <AlertAction>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Dismiss missing bank statements warning"
                    onClick={() => setDismissed(true)}
                >
                    <X />
                </Button>
            </AlertAction>
        </Alert>
    )
}

export default MissingBankStatementsAlert
