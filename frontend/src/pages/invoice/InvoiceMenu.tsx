import { Copy, Download, Mail, Printer, Save, Undo2 } from 'lucide-react'
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
    canEmail: boolean
    canExportXml: boolean
    canRevert: boolean
    canDuplicate: boolean
    isSaving: boolean
    isDuplicating: boolean
    isExportingXml: boolean
    onSave: () => void
    onPrint: () => void
    onEmail: () => void
    onExportXml: () => void
    onRevert: () => void
    onDuplicate: () => void
}

function InvoiceMenu({ canSave, canPrint, canEmail, canExportXml, canRevert, canDuplicate, isSaving, isDuplicating, isExportingXml, onSave, onPrint, onEmail, onExportXml, onRevert, onDuplicate }: InvoiceMenuProps) {
    return (
        <Menubar className="w-fit">
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
                    <MenubarItem disabled={!canEmail} onClick={onEmail}>
                        <Mail />Send email
                    </MenubarItem>
                    <MenubarItem disabled={!canExportXml || isExportingXml} onClick={onExportXml}>
                        <Download />{isExportingXml ? 'Exporting XML…' : 'Export XML'}
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canRevert} onClick={onRevert}>
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

export default InvoiceMenu
