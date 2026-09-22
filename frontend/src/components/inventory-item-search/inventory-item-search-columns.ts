import type { InventoryItemSortColumn } from './types'

export const inventoryItemSortColumns: {
    key: InventoryItemSortColumn
    label: string
    alignRight?: boolean
}[] = [
    { key: 'productCode', label: 'Product code' },
    { key: 'name', label: 'Name' },
    { key: 'unit', label: 'Unit' },
    { key: 'minimumStockLevel', label: 'Minimum stock level', alignRight: true },
]
