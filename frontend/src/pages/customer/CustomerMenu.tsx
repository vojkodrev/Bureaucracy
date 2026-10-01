import { Copy, Save, Undo2 } from 'lucide-react'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar'

type CustomerMenuProps = {
    canSave: boolean
    canRevert: boolean
    canDuplicate: boolean
    isSaving: boolean
    isDuplicating: boolean
    onSave: () => void
    onRevert: () => void
    onDuplicate: () => void
}

function CustomerMenu({
    canSave, canRevert, canDuplicate, isSaving, isDuplicating,
    onSave, onRevert, onDuplicate,
}: CustomerMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canSave || isSaving} onClick={onSave}>
                        <Save />{isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
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

export default CustomerMenu
