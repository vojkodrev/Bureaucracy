import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox'

const pageSizes = [20, 50, 100, 10_000]

type PagerProps = {
    firstItem: number
    lastItem: number
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

function Pager({
    firstItem,
    lastItem,
    page,
    pageSize,
    totalItems,
    totalPages,
    onPageChange,
    onPageSizeChange,
}: PagerProps) {
    const selectedPageSize = pageSizes.includes(pageSize) ? pageSize : pageSizes[0]

    return (
        <div className="mb-2 flex flex-nowrap items-center justify-end gap-1 sm:gap-2">
            <span className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
                <span className="sm:hidden">Rows</span>
                <span className="hidden sm:inline">Rows per page</span>
            </span>
            <Combobox
                items={pageSizes}
                value={selectedPageSize}
                onValueChange={(value) => onPageSizeChange(value ?? pageSizes[0])}
                itemToStringLabel={(value) => value.toLocaleString()}
                itemToStringValue={(value) => String(value)}
            >
                <ComboboxInput
                    aria-label="Rows per page"
                    className="w-26 shrink-0 sm:w-36"
                />
                <ComboboxContent className="w-36 min-w-36">
                    <ComboboxList>
                        {(size: number) => (
                            <ComboboxItem className="pr-10" key={size} value={size}>
                                {size.toLocaleString()}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
            <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums sm:text-sm">
                {firstItem}–{lastItem} of {totalItems}
            </span>
            <div className="flex shrink-0 gap-1 sm:gap-2">
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
        </div>
    )
}

export default Pager
