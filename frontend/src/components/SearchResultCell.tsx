import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Props = ComponentProps<typeof TableCell> & {
    to?: string
    linkLabel: string
    primary?: boolean
}

export default function SearchResultCell({ to, linkLabel, primary = false, className, children, ...props }: Props) {
    return (
        <TableCell className={cn('relative', className)} {...props}>
            {to && (
                // Safari needs the overlay anchored to a cell rather than a table row.
                <Link
                    to={to}
                    aria-label={linkLabel}
                    tabIndex={primary ? undefined : -1}
                    aria-hidden={primary ? undefined : true}
                    className="absolute inset-0 z-10 rounded focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                />
            )}
            {children}
        </TableCell>
    )
}
