import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PagerProps = {
    firstItem: number
    lastItem: number
    page: number
    totalItems: number
    totalPages: number
    onPageChange: (page: number) => void
}

function Pager({
    firstItem,
    lastItem,
    page,
    totalItems,
    totalPages,
    onPageChange,
}: PagerProps) {
    return (
        <div className="mb-2 flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground tabular-nums">
                {firstItem}–{lastItem} of {totalItems}
            </span>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                <ChevronLeft />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                <ChevronRight />
            </Button>
        </div>
    )
}

export default Pager
