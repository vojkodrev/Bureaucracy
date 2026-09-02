const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
})

export function formatCurrency(value: number): string {
    return currencyFormatter.format(value)
}

export function formatDate(value: string | null): string {
    return value ? dateFormatter.format(new Date(value)) : '—'
}
