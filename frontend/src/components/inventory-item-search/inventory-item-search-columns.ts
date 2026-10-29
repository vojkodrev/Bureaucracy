import type { InventoryItemSortColumn } from './types'

export const inventoryItemSortColumns: {
    key: InventoryItemSortColumn
    label: string
    alignRight?: boolean
}[] = [
    { key: 'inventoryItemCode', label: 'Inventory item code' },
    { key: 'name', label: 'Inventory item name' },
    { key: 'unit', label: 'Unit' },
    { key: 'minimumStockLevel', label: 'Minimum stock level', alignRight: true },
]
