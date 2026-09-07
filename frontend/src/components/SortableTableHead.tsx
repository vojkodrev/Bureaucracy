import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableHead } from '@/components/ui/table'

type SortableTableHeadProps = {
    label: string
    direction: 'asc' | 'desc' | ''
    alignRight?: boolean
    onSort: () => void
}

function SortableTableHead({
    label,
    direction,
    alignRight = false,
    onSort,
}: SortableTableHeadProps) {
    const SortIcon = direction === 'asc'
        ? ArrowUp
        : direction === 'desc'
            ? ArrowDown
            : ArrowUpDown

    return (
        <TableHead
            className={alignRight ? 'text-right' : undefined}
            aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
        >
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className={alignRight ? '-mr-3 ml-auto' : '-ml-3'}
                onClick={onSort}
            >
                {label}
                <SortIcon aria-hidden="true" />
            </Button>
        </TableHead>
    )
}

export default SortableTableHead
