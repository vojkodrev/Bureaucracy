import type { ProductSortColumn } from './types'

export const productSortColumns: {
    key: ProductSortColumn
    label: string
    alignRight?: boolean
}[] = [
    { key: 'productCode', label: 'Product code' },
    { key: 'name', label: 'Name' },
    { key: 'unit', label: 'Unit' },
    { key: 'netPrice', label: 'Net price', alignRight: true },
    { key: 'grossPrice', label: 'Gross price', alignRight: true },
    { key: 'taxCode', label: 'Tax code' },
    { key: 'taxRate', label: 'Tax rate', alignRight: true },
]
