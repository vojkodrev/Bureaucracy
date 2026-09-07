import { Printer, Save, Undo2 } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type InvoiceMenuProps = {
    canSave: boolean
    canPrint: boolean
    canRevert: boolean
    isSaving: boolean
    onSave: () => void
    onPrint: () => void
    onRevert: () => void
}

function InvoiceMenu({ canSave, canPrint, canRevert, isSaving, onSave, onPrint, onRevert }: InvoiceMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canSave || isSaving} onClick={onSave}>
                        <Save />{isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled={!canPrint} onClick={onPrint}>
                        <Printer />Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canRevert} onClick={onRevert}>
                        <Undo2 />Revert
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceMenu
