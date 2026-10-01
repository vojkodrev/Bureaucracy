import { Copy, Download, FileCode2, Landmark, Mail, Printer, Save, Undo2 } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
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
    isExportingHalcom: boolean
    onSave: () => void
    onPrint: () => void
    onEmail: () => void
    onExportXml: () => void
    onExportHalcom: () => void
    onRevert: () => void
    onDuplicate: () => void
}

function InvoiceMenu({ canSave, canPrint, canEmail, canExportXml, canRevert, canDuplicate, isSaving, isDuplicating, isExportingXml, isExportingHalcom, onSave, onPrint, onEmail, onExportXml, onExportHalcom, onRevert, onDuplicate }: InvoiceMenuProps) {
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
                    <MenubarSub>
                        <MenubarSubTrigger disabled={!canExportXml}>
                            <Download />Export
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled={!canExportXml || isExportingXml} onClick={onExportXml}>
                                <FileCode2 />{isExportingXml ? 'Exporting XML…' : 'XML'}
                            </MenubarItem>
                            <MenubarItem disabled={!canExportXml || isExportingHalcom} onClick={onExportHalcom}>
                                <Landmark />{isExportingHalcom ? 'Exporting Halcom package…' : 'Export for Halcom e-banking'}
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
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
