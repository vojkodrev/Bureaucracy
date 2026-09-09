import { Save, Undo2 } from 'lucide-react'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar'

type CustomerMenuProps = {
    canSave: boolean
    canRevert: boolean
    isSaving: boolean
    onSave: () => void
    onRevert: () => void
}

function CustomerMenu({ canSave, canRevert, isSaving, onSave, onRevert }: CustomerMenuProps) {
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
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default CustomerMenu
