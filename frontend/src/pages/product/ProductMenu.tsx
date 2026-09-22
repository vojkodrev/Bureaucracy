import { Copy, PackagePlus, Save, Undo2 } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type ProductMenuProps = {
    canSave: boolean
    canRevert: boolean
    canDuplicate: boolean
    isSaving: boolean
    isDuplicating: boolean
    onSave: () => void
    onRevert: () => void
    onDuplicate: () => void
    canCreateInventoryItem?: boolean
    onCreateInventoryItem?: () => void
}

function ProductMenu({
    canSave,
    canRevert,
    canDuplicate,
    isSaving,
    isDuplicating,
    onSave,
    onRevert,
    onDuplicate,
    canCreateInventoryItem = false,
    onCreateInventoryItem,
}: ProductMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent className="w-max">
                    <MenubarItem disabled={!canSave || isSaving} onClick={onSave}>
                        <Save />{isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    {onCreateInventoryItem && (
                        <MenubarItem
                            className="whitespace-nowrap"
                            disabled={!canCreateInventoryItem}
                            onClick={onCreateInventoryItem}
                        >
                            <PackagePlus />Create inventory item
                        </MenubarItem>
                    )}
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canRevert || isSaving} onClick={onRevert}>
                        <Undo2 />Revert
                    </MenubarItem>
                    <MenubarItem disabled={!canDuplicate || isDuplicating} onClick={onDuplicate}>
                        <Copy />{isDuplicating ? 'Duplicating…' : 'Duplicate'}
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default ProductMenu
